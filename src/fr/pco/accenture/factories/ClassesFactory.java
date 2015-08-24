package fr.pco.accenture.factories;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import edu.stanford.smi.protegex.owl.model.OWLIndividual;
import edu.stanford.smi.protegex.owl.model.OWLModel;
import edu.stanford.smi.protegex.owl.model.OWLNamedClass;
import edu.stanford.smi.protegex.owl.model.RDFProperty;
import fr.pco.accenture.models.Class;
import fr.pco.accenture.models.ClassSettings;
import fr.pco.accenture.models.Property;
import fr.pco.accenture.models.PropertySettings;
import fr.pco.accenture.utils.Files;
import fr.pco.accenture.utils.Helper;
import fr.pco.accenture.utils.JSON;

public class ClassesFactory {
	private static Map<String, Map<String, Class>> classes;

	public static void init() throws JsonIOException, JsonSyntaxException, FileNotFoundException {
		classes = new HashMap<String, Map<String, Class>>();
		loadAll();
	}

	public static void loadAll() throws JsonIOException, JsonSyntaxException, FileNotFoundException {
		for(String name : ModelsFactory.getNames()){
			load(name, ModelsFactory.get(name));
		}
	}

	public static boolean has(String modelName){
		return classes.containsKey(modelName);
	}

	public static boolean has(String modelName, String className){
		return (classes.containsKey(modelName) && classes.get(modelName) != null && classes.get(modelName).containsKey(className));
	}

	@SuppressWarnings("deprecation")
	public static void load(String modelName, OWLModel model) throws JsonIOException, JsonSyntaxException, FileNotFoundException {
		System.out.println("* LOAD S, M : " );
		if(! has(modelName))
			classes.put(modelName, new HashMap<String, Class>());
		// Lecture de la première class dans le modèle
		String firstClassName = model.getOWLDataRangeClass().getDirectSuperclasses().toString();
		firstClassName = Helper.stringBetween(firstClassName, "(", ")");
		System.out.println("firstClasseName    :   :  " + firstClassName);
		for(Object o : model.getOWLNamedClass(firstClassName).getVisibleDirectSubclasses()){
		    String name = Helper.stringBetween(o.toString(), "(", ")");
		    System.out.println("Superclasse: " + name);
		    // Chargement de cette classe et de ses classes filles
		    load(modelName, name);
		}
//		String firstClassName = model.getOWLDataRangeClass().getDirectSuperclasses().toString();
//		firstClassName = Helper.stringBetween(firstClassName, "(", ")");
//		System.out.println("* First ClasseName :" + firstClassName);
//		
//		firstClassName = model.getOWLNamedClass(firstClassName).getVisibleDirectSubclasses().toString();
//		firstClassName = Helper.stringBetween(firstClassName, "(", ")");
//		System.out.println("* First ClasseName second:" + firstClassName);
//		
//		// Chargement de cette classe et de ses classes filles
//		load(modelName, firstClassName);
	}

	/**
	 * Cette méthode charge une classe et ses classes filles de manière récursive
	 */
	public static Class load(String modelName, String className) throws JsonIOException, JsonSyntaxException, FileNotFoundException {
		System.out.println("** LOAD S,S       " + className);
		Class result = loadOne(modelName, className);
		System.out.println("** RESULT  " + result );
		for(String child : result.getChilds()){
			load(modelName, child);
		}
		System.out.println("** RESULT Final " + result);
		return result;
	}

	public static Class loadOne(String modelName, String className) throws JsonIOException, JsonSyntaxException, FileNotFoundException {
		if(! ModelsFactory.has(modelName))
			return null;
		Gson serializer = new Gson();
		File classFolder = new File(Files.classFolderPath(modelName, className));
		if(!classFolder.exists())
			classFolder.mkdir();
		// Chargement de la classe
		OWLModel model = ModelsFactory.get(modelName);
		Helper helper = new Helper(model);
		OWLNamedClass namedClass = model.getOWLNamedClass(className);
		if(namedClass == null)
			return null;
		// Chargement des instances
		List<String> instances = new ArrayList<String>();
		Collection<?> individuals = namedClass.getInstances(false);
	    for (Iterator<?> it = individuals.iterator(); it.hasNext();) {
	         instances.add(((OWLIndividual) it.next()).getBrowserText());
		}
		// Chargement des propriétés
		List<Property> properties = new ArrayList<Property>();
		for(RDFProperty property : helper.getProperties(className)){
			PropertySettings ps = null;
			File file = new File(Files.propertySettingsFilePath(modelName, className, property.getName()));
			if(file.exists()){
				Type type = new TypeToken<PropertySettings>() {}.getType();
				ps = serializer.fromJson(new FileReader(file), type);
			}
			properties.add(new Property(property, ps));
		}
		// Chargement des préférences
		ClassSettings setts = null;
		File file = new File(Files.classSettingsFilePath(modelName, className));
		if(file.exists()){
			Type type = new TypeToken<ClassSettings>() {}.getType();
			setts = serializer.fromJson(new FileReader(file), type);
		}
		// Chargement des noms des classes filles
		List<String> childs = helper.getChilds(className);
		System.out.println("****  Childs  " + childs );
		// Construire la classe
		Class result = new Class(className, childs, instances, properties, setts);
		System.out.println("***** construct Class  " + result);
		// Ajouter la classes dans la table de hashage
		classes.get(modelName).put(className, result);
		return result;
	}


	public static Class get(String modelName, String className) {
		if(has(modelName, className))
			return classes.get(modelName).get(className);
		return null;
	}

	public static Set<String> getNames(String modelName) {
		if(has(modelName))
			return classes.get(modelName).keySet();
		return null;
	}

}
