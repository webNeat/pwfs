package fr.pco.accenture.utils;

import java.io.File;
import java.io.IOException;

import javax.servlet.http.Part;

public class Files {
	private static String projectsPath;

	public static String getProjectsPath(){
		return projectsPath;
	}

	public static void setProjectsPath(String path) throws IOException{
		File file = new File(path);
		if(!file.exists() || !file.isDirectory())
			throw new IOException("The given projects path is not a directory !");

		projectsPath = path;
	}

	public static String[] projectsFolderNames(){
		File file = new File(projectsPath);
		return file.list();
	}

	public static String projectFolderPath(String projectName){
		return projectsPath + File.separator + projectName;
	}

	public static String projectSettingsFilePath(String projectName){
		return projectsPath + File.separator + projectName + File.separator + "settings.json";
	}

	public static String modelFilePath(String projectName){
		File folder = new File(projectsPath + File.separator + projectName);
		String[] files = folder.list();
		for(String filename : files){
			if(filename.endsWith(".pprj"))
				return projectsPath + File.separator + projectName + File.separator + filename;
		}
		return null;
	}

	public static String classesFolderPath(String projectName){
		return projectFolderPath(projectName) + File.separator + "classes";
	}

	public static String classFolderPath(String projectName, String className){
		return classesFolderPath(projectName) + File.separator + className;
	}

	public static String classSettingsFilePath(String projectName, String className){
		className = Helper.stringAfter(className, "#").replaceAll(File.separator, "_");
		return classesFolderPath(projectName) + File.separator + className + ".json";
	}

	public static String propertySettingsFilePath(String projectName, String className, String propertyName){
		className = Helper.stringAfter(className, "#").replaceAll(File.separator, "_");
		return classFolderPath(projectName, className) + File.separator + propertyName + ".json";
	}

	public static String getFileNameFromPart(Part part){
		for (String cd : part.getHeader("content-disposition").split(";")) {
		    if (cd.trim().startsWith("filename")) {
		        String fileName = cd.substring(cd.indexOf('=') + 1).trim().replace("\"", "");
		        return fileName.substring(fileName.lastIndexOf('/') + 1).substring(fileName.lastIndexOf('\\') + 1); // MSIE fix.
		    }
		}
		return null;
	}

}
