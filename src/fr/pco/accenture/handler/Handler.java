package fr.pco.accenture.handler;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Part;

import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;

import edu.stanford.smi.protegex.owl.model.OWLIndividual;
import edu.stanford.smi.protegex.owl.model.OWLModel;
import edu.stanford.smi.protegex.owl.model.RDFProperty;
import edu.stanford.smi.protegex.owl.model.RDFResource;
import fr.pco.accenture.factories.ClassesFactory;
import fr.pco.accenture.factories.InstancesFactory;
import fr.pco.accenture.factories.ModelsFactory;
import fr.pco.accenture.factories.ProjectsFactory;
import fr.pco.accenture.models.Class;
import fr.pco.accenture.models.ClassSettings;
import fr.pco.accenture.models.Instance;
import fr.pco.accenture.models.Project;
import fr.pco.accenture.utils.Files;
import fr.pco.accenture.utils.Helper;
import fr.pco.accenture.utils.JSON;

/**
 * C'est la classe qui exécute et construit la reponse de chaque requête
 */
public class Handler {
	private Map< String, String[]> params; // paramètres de la requête
	private String projectName;
	private Project project;
	private String className;
	private Class classe;
	private String instanceName;
	private Instance instance;
	
	/**
	 * Cette méthode est appelée à chaque requète pour initialiser
	 * le project, la classe et l'instance sur lesquels agit la requète
	 */
	public void init(Map< String, String[]> params){
		this.params = params;
		if(params.containsKey("project")){ // Si un projet est spécifié
			projectName = params.get("project")[0];
			project = ProjectsFactory.get(projectName);
			if(project != null){ // Si le projet existe
				if(params.containsKey("class")){ // Si une classe est spécifiée
					className = params.get("class")[0];
					classe = ClassesFactory.get(projectName, className);
				} else {
					className = null;
					classe = null;
				}
				if(params.containsKey("instance")){ // Si une instance est spécifiée
					instanceName = params.get("instance")[0];
					instance = InstancesFactory.get(projectName, instanceName);
				} else {
					instanceName = null;
					instance = null;
				}
			}
		} else {
			projectName = null;
			project = null;
			className = null;
			classe = null;
			instanceName = null;
			instance = null;
		}
	}

	/**
	 * Traitement de la requète
	 * GET /api/projects
	 * 
	 * Retourne la liste des projets
	 */
	public List<Project> getProjects(){
		List<Project> result = new ArrayList<Project>();
		for(String name : ProjectsFactory.getNames())
			result.add(ProjectsFactory.get(name));
		return result;
	}

	/**
	 * Traitement de la requète
	 * GET /api/classes
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	
	 * Retourne la liste des classes du projet
	 */
	public List<Class> getClasses(){
		if(project == null)
			return null;
		List<Class> result = new ArrayList<Class>();
		for(String name : ClassesFactory.getNames(projectName)){
			result.add(ClassesFactory.get(projectName, name));
		}
		return result;
	}

	/**
	 * Traitement de la requète
	 * GET /api/instances
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	class: le nom de la classe
	 * 	
	 * Retourne la liste des instances de la classe spécifiée. 
	 * 	Si aucune classe n'est spécifiée; retourne toutes les instances du projet
	 */
	public List<Instance> getInstances(){
		if(project == null || ( className != null && classe == null) )
			return null;
		List<Instance> result = new ArrayList<Instance>();
		if(className == null){ // Retourner toutes les instances
			for(String name : InstancesFactory.getNames(projectName))
				result.add(InstancesFactory.get(projectName, name));
		} else {
			for(String name : ClassesFactory.get(projectName, className).getInstances())
				result.add(InstancesFactory.get(projectName, name));
		}
		return result;
	}

	/**
	 * Traitement de la requète
	 * GET /api/class-settings
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	class: le nom de la classe
	 * 	
	 * Retourne les préférences de la classe
	 */
	public ClassSettings getClassSettings(){
		if(project == null || classe == null)
			return null;
		return classe.getSetts();
	}

	/**
	 * Traitement de la requète
	 * GET /api/instance
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	instance: le nom de l'instance
	 * 	
	 * Retourne l'instance
	 */
	public Instance getInstance(){
		return instance;
	}

	/**
	 * Traitement de la requète
	 * POST /api/projects
	 * Paramètres de la requète:
	 * 	name: le nom du project à créer
	 * 	file1, file2, file3: les fichiers du projet
	 *
	 * Crée le dossier du projet et upload les fichiers puis le charge.
	 * La réponse précise si l'ajout a été bien fait ou si une erreur s'est produit
	 */
	public Map<String, Object> addProject(String name, Part[] files) throws IOException {
		Map<String, Object> result = new HashMap<String, Object>();
		if(ProjectsFactory.get(name) != null){
			result.put("done", false);
			result.put("erreur", "Duplicated project name");
		} else {
			String foldername = Files.projectFolderPath(name);
			File folder = new File(foldername);
			if( ! folder.mkdir() ){
				result.put("done", false);
				result.put("erreur", "Cannot create the folder : " + foldername);
			} else {
				new File(Files.classesFolderPath(name)).mkdir();

				for(int i = 0; i < 3; i ++){
					InputStream in = files[i].getInputStream();
					String filename = foldername + File.separator + Files.getFileNameFromPart(files[i]);
					OutputStream out = new FileOutputStream(new File(filename));
					int read = 0;
					byte[] buffer = new byte[1024];
					while((read = in.read(buffer)) != -1)
						out.write(buffer, 0, read);
					out.close();
				}
				ModelsFactory.loadAll();
				ProjectsFactory.loadAll();
				ClassesFactory.loadAll();
				InstancesFactory.loadAll();
				if(ModelsFactory.get(name) != null && ProjectsFactory.get(name) != null)
					result.put("done", true);
				else {
					result.put("done", false);
					result.put("erreur", "Cannot load the project '" + name + "'");
				}
			}
		}
		return result;
	}

	/**
	 * Traitement de la requète
	 * POST /api/instances
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	class: le nom de la classe à laquelle on veut ajouter l'instance
	 * 	instance: nom de l'instance à créer
	 * 	action: "create"
	 * 	
	 * Crée une nouvelle instance.
	 * La réponse précise si la création a été bien faite ou si une erreur s'est produit
	 */
	public Map<String, Object> addInstance() throws JsonIOException, JsonSyntaxException, FileNotFoundException {
		Map<String, Object> result = new HashMap<String, Object>();
		if(project != null && classe != null && instanceName != null){
			RDFResource r = ModelsFactory.get(projectName).getOWLNamedClass(className).createInstance(instanceName);
			ClassesFactory.load(projectName, ModelsFactory.get(projectName));
			InstancesFactory.load(projectName);
			result.put("done", (r != null));
			if(r == null)
				result.put("error", "Cannot create the instance '"+instanceName+"' for the class '"+className+"' of project '"+projectName+"'");
		} else {
			result.put("done", false);
			result.put("error", "Missing project or class or instance names");
		}
		return result;
	}
	
	/**
	 * Traitement de la requète
	 * POST /api/instances
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	instance: nom de l'instance à supprimer
	 * 	action: "remove"
	 * 	
	 * Supprime une instance.
	 * La réponse précise si la création a été bien faite ou si une erreur s'est produit
	 */
	public Map<String, Object> removeInstance() throws JsonIOException, JsonSyntaxException, FileNotFoundException {
		Map<String, Object> result = new HashMap<String, Object>();
		if(project != null && instanceName != null){
			OWLIndividual instance = ModelsFactory.get(projectName).getOWLIndividual(instanceName);
			instance.delete();
			ClassesFactory.load(projectName, ModelsFactory.get(projectName));
			InstancesFactory.load(projectName);
			result.put("done", true);
		} else {
			result.put("done", false);
			result.put("error", "Missing project or instance name");
		}
		return result;
	}
	
	/**
	 * Traitement de la requète
	 * POST /api/values
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	instance: nom de l'instance
	 * 	property: nom de la propriété
	 * 	value: la valeur de la propriété
	 * 	
	 * Sauvegarde les valeurs de l'instance.
	 * La réponse précise si la sauvegarde a été bien faite ou si une erreur s'est produit
	 */
	public Map<String, Object> saveValue() {
		Map<String, Object> result = new HashMap<String, Object>();
		if(project != null && instanceName != null){
			OWLModel model = ModelsFactory.get(projectName);
			Helper helper = new Helper(model);
			if(params.containsKey("property")){
				OWLIndividual instance = model.getOWLIndividual(instanceName);
				if(instance != null){
					RDFProperty p = model.getRDFProperty(params.get("property")[0]);
					if(p.getRangeDatatype() != null) {
						if(p.isFunctional()){
							String val = "";
							if(params.containsKey("value"))
								val = params.get("value")[0];
							helper.addValueToDatatypeProperty(instance, p.getName(), val);
						} else {
							helper.removeValuesOfDatatypeProperty(instance, p.getName());
							for(String val : params.get("value"))
								helper.addValueToDatatypeProperty(instance, p.getName(), val);
						}
					} else {
						helper.removeValuesOfObjectProperty(instance, p.getName());
						if(params.containsKey("value")){
							for(String value : params.get("value"))
								helper.addValueToObjectProperty(instance, p.getName(), value);
						}
					}
					InstancesFactory.load(projectName);
					result.put("done", true);
				} else {
					result.put("done", false);
					result.put("error", "Instance '" + instanceName + "' not found");
				}

			} else {
				result.put("done", false);
				result.put("error", "Missing property name");
			}
		} else {
			result.put("done", false);
			result.put("error", "Missing project or instance name");
		}
		return result;
	}

	/**
	 * Traitement de la requète
	 * POST /api/class-settings
	 * Paramètres de la requète:
	 * 	project: le nom du project
	 * 	class: nom de la classe
	 * 	filters: liste des filtres à appliquer au instances de cette classe
	 * 	separators: liste des separateurs des filtres
	 * 	
	 * Sauvegarde les préférences de la classe
	 * La réponse précise si la sauvegarde a été bien faite ou si une erreur s'est produit
	 * @throws IOException 
	 */
	public Map<String, Object> saveClassSettings() throws IOException{
		Map<String, Object> result = new HashMap<String, Object>();
		if(project == null){
			result.put("done", false);
			result.put("error", "Missing project name");
		} else if(className == null){
			result.put("done", false);
			result.put("error", "Missing class name");
		} else if(classe == null){
			result.put("done", false);
			result.put("error", "Class '" + className + "' not found");
		// } else if(!params.containsKey("filters") || !params.containsKey("separators")){
		// 	result.put("done", false);
		// 	result.put("error", "Some request parameters are missing");
		} else {
			List<String> filters = null;
			if(params.get("filters") != null)
				filters = Arrays.asList(params.get("filters"));
			List<String> separators = null;
			if(params.get("separators") != null)
				separators = Arrays.asList(params.get("separators"));
			
			
			ClassSettings cs = new ClassSettings(filters, separators);
			String path = Files.classSettingsFilePath(projectName, className);
			JSON.write(cs, path);
			System.out.println("filters: " + filters);
			System.out.println("separators: " + separators);
			System.out.println("Settings saved !");
			ClassesFactory.loadOne(projectName, className);
			result.put("done", true);
		}
		return result;
	}

}
