package fr.pco.accenture.factories;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import edu.stanford.smi.protege.model.Project;
import edu.stanford.smi.protegex.owl.model.OWLModel;
import fr.pco.accenture.utils.Files;

public class ModelsFactory {
	private static Map<String, OWLModel> models;

	public static void init() {
		models = new HashMap<String, OWLModel>();
		loadAll();
	}

	public static boolean has(String name){
		return models.containsKey(name);
	}

	public static void loadAll() {
		String[] names = Files.projectsFolderNames();
		for(String name : names){
			if(! has(name) && new File(Files.projectFolderPath(name)).isDirectory()){
				load(name);
			}
		}
	}

	public static OWLModel load(String name) {
		OWLModel result = null;
		String path = Files.modelFilePath(name);
		if(path != null){
			Collection<String> errors = new ArrayList<String>();
			Project currentProject = Project.loadProjectFromFile(path, errors);
			result = (OWLModel) currentProject.getKnowledgeBase();
		}
		if(result != null)
			models.put(name, result);
		return result;
	}

	public static OWLModel get(String name) {
		return (has(name)) ? models.get(name) : null;
	}

	public static Set<String> getNames() {
		return models.keySet();
	}

}
