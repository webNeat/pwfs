package fr.pco.accenture.factories;

import java.io.File;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import fr.pco.accenture.models.Project;
import fr.pco.accenture.models.ProjectSettings;
import fr.pco.accenture.utils.Files;

public class ProjectsFactory {
	private static Map<String, Project> projects;

	public static void init() {
		projects = new HashMap<String, Project>();
		loadAll();
	}

	public static boolean has(String name){
		return projects.containsKey(name);
	}

	public static void loadAll() {
		String[] names = Files.projectsFolderNames();
		for(String name : names){
			if(! has(name) && new File(Files.projectFolderPath(name)).isDirectory()){
				load(name);
			}
		}
	}

	public static Project load(String name) {
		ProjectSettings setts = null;
		//(ProjectSettings) JSON.read(, .class);
		File file = new File(Files.projectSettingsFilePath(name));
		if(file.exists()){
			Type type = new TypeToken<ProjectSettings>() {}.getType();
			try {
				setts = new Gson().fromJson(new FileReader(file), type);				
			} catch (Exception e){
				// Logger l'exception !
			}
		}
		Project result = new Project(name, setts);
		projects.put(name, result);
		return result;
	}

	public static Project get(String name) {
		return (has(name)) ? projects.get(name) : null;
	}

	public static Set<String> getNames() {
		return projects.keySet();
	}

}
