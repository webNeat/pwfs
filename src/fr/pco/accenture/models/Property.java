package fr.pco.accenture.models;

import java.util.ArrayList;
import java.util.List;

import edu.stanford.smi.protegex.owl.model.RDFProperty;
import fr.pco.accenture.utils.Helper;

public class Property {
	private String name; // Le nom de la propriété
	private String type; 
	// Si type == "data" alors c'est une DataType 
	// Si type == "object" alors c'est une ObjectProperty
	private boolean multiple; // Si la propriété accèpte plusieurs valeurs
	private List<String> classes; // La liste des classes des valeurs; null dans le cas d'un DataType
	private PropertySettings setts; // Les préférences de cette propriété

	public Property() {}
	public Property(String name, String type, boolean multiple, List<String> classes, PropertySettings setts){
		this.name = name;
		this.type = type;
		this.multiple = multiple;
		this.classes = classes;
		this.setts = setts;
	}

	// Construire une propriété à partir d'une RDFProperty
	public Property(RDFProperty property, PropertySettings ps){
		name = property.getName(); // lecture du nom
		multiple = ! property.isFunctional(); // plusieurs valeurs ?
		if(property.getRangeDatatype() != null){ // C'est un DataType
			type = "data";
			classes = null;
		} else { // C'est une ObjectProperty
			type = "object";
			classes = new ArrayList<String>();
			for(Object c : property.getRanges(true)){
				String name = Helper.stringBetween(c.toString(), "(", ")");
				if(name != null)
					classes.add(name);
			}
		}
		setts = ps;
	}
	
	public String getName(){
		return name;
	}
	public void setName(String name){
		this.name = name;
	}
	public String getType(){
		return type;
	}
	public void setType(String type){
		this.type = type;
	}
	public boolean getMultiple(){
		return multiple;
	}
	public void setMultiple(boolean multiple){
		this.multiple = multiple;
	}
	public List<String> getClasses(){
		return classes;
	}
	public void setClasses(List<String> classes){
		this.classes = classes;
	}
	public PropertySettings getSetts(){
		return setts;
	}
	public void setSetts(PropertySettings setts){
		this.setts = setts;
	}
}
