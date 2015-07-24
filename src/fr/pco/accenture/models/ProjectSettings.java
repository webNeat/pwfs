package fr.pco.accenture.models;

import java.util.Date;

public class ProjectSettings {
	private int classesWidth;
	private int instancesWidth;
	private Date created;
	private Date modified;

	public ProjectSettings(){}
	public ProjectSettings(int classesWidth, int instancesWidth, Date created, Date modified){
		this.classesWidth = classesWidth;
		this.instancesWidth = instancesWidth;
		this.created = created;
		this.modified = modified;
	}

	public int getClassesWidth(){
		return classesWidth;
	}
	public void setClassesWidth(int classesWidth){
		this.classesWidth = classesWidth;
	}
	public int getInstancesWidth(){
		return instancesWidth;
	}
	public void setInstancesWidth(int instancesWidth){
		this.instancesWidth = instancesWidth;
	}
	public Date getCreated(){
		return created;
	}
	public void setCreated(Date created){
		this.created = created;
	}
	public Date getModified(){
		return modified;
	}
	public void setModified(Date modified){
		this.modified = modified;
	}
}
