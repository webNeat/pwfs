package fr.pco.accenture.models;


public class Project {
	private String name;
	private ProjectSettings setts;

	public Project(){}
	public Project(String name, ProjectSettings setts){
		this.name = name;
		this.setts = setts;
	}

	public String getName(){
		return name;
	}
	public void setName(String name){
		this.name = name;
	}
	public ProjectSettings getSetts(){
		return setts;
	}
	public void setSetts(ProjectSettings setts){
		this.setts = setts;
	}
}
