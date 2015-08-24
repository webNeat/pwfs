package fr.pco.accenture.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import edu.stanford.smi.protegex.owl.model.OWLDatatypeProperty;
import edu.stanford.smi.protegex.owl.model.OWLIndividual;
import edu.stanford.smi.protegex.owl.model.OWLModel;
import edu.stanford.smi.protegex.owl.model.OWLObjectProperty;
import edu.stanford.smi.protegex.owl.model.RDFProperty;

public class Helper {

	private OWLModel model;

	public static String stringBetween(String str, String first, String last){
		int firstIndex = str.indexOf(first);
		int lastIndex = str.lastIndexOf(last);
		if(firstIndex == -1 || lastIndex == -1 || firstIndex > lastIndex )
			return null;
		return str.substring(firstIndex + 1, lastIndex); 
	}

	public static String stringAfter(String str, String separator){
		int separatorIndex = str.indexOf(separator);
		if(separatorIndex != -1 )
			str = str.substring(separatorIndex + 1);
		return str;
	}

	public Helper(OWLModel owlModel) {
		model = owlModel;
	}

	public String getRootClass() {
		@SuppressWarnings("deprecation")
		String rootClass = model.getOWLDataRangeClass().getDirectSuperclasses().toString();
		return rootClass.substring(rootClass.indexOf('(') + 1, rootClass.indexOf(')'));
	}

	public String getFirstClass() {
		@SuppressWarnings("deprecation")
		String firstClass = model.getOWLNamedClass(getRootClass()).getVisibleDirectSubclasses().toString();
		return stringBetween(firstClass, "(", ")");
	}

	public List<String> getChilds(String className) {
		List<String> childs = new ArrayList<String>();
		@SuppressWarnings("deprecation")
		String[] subClasses = model.getOWLNamedClass(className).getDirectSubclasses().toString().split(" ");
		for(String name : subClasses){
			String child = stringBetween(name, "(", ")");
			if(child != null)
				childs.add(child);
		}
		return childs;
	}
	
	public String getSuperClass(String className){
		return stringBetween(
				model.getOWLNamedClass(className)
					.getNamedSuperclasses()
					.toString(),
				"(", ")");
	}
	
	public List<String> getSuperClasses(String className){
		List<String> superClasseNames = new ArrayList<String>();
		superClasseNames.add(className);
		if( ! className.equals(getFirstClass())){
			String superClass = getSuperClass(className);
			if(superClass != null)
				superClasseNames.addAll(getSuperClasses(superClass));
		}
		return superClasseNames;
	}
	
	public List<OWLIndividual> getIndividuals(String className){
		List<OWLIndividual> inds = new ArrayList<OWLIndividual>();
		Collection<?> instances = model.getOWLNamedClass(className).getInstances(false);
	    for (Iterator<?> jt = instances.iterator(); jt.hasNext();) {
	         inds.add((OWLIndividual) jt.next());
		}
	    return inds;
	}
	
	@SuppressWarnings("deprecation")
	public List<RDFProperty> getProperties(String className){
		List<RDFProperty> ps = new ArrayList<RDFProperty>();
		for(String aClass : getSuperClasses(className)){
			for(Object slot : model.getOWLNamedClass(aClass).getDirectTemplateSlots()){
		        ps.add((RDFProperty) slot);
			}
		}
		return ps;
	}
	
	public boolean addValueToObjectProperty(OWLIndividual instance, String property, String valueToAdd) {
		System.out.println("Adding value " + valueToAdd + " to property " + property);
		OWLObjectProperty owlObjectProperty = model.getOWLObjectProperty(property); //Property
		instance.addPropertyValue(owlObjectProperty, model.getOWLIndividual(valueToAdd)); //la valeur
		return true;
	}

	public boolean addValueToDatatypeProperty(OWLIndividual instance, String property, String valueToAdd){
	    OWLDatatypeProperty protegePropGet = model.getOWLDatatypeProperty(property);
	    // instance.removePropertyValue(protegePropGet, instance.getPropertyValue(protegePropGet));
	    if(! valueToAdd.equals(""))
	    	instance.addPropertyValue(protegePropGet, valueToAdd);
	    System.out.println("Value: '" + valueToAdd + "'");
		return true;
	}

	public void removeValuesOfObjectProperty(OWLIndividual instance, String property) {
		System.out.println("Removing values of " + property);
		OWLObjectProperty owlObjectProperty = model.getOWLObjectProperty(property); //Property
		for(Object v : instance.getPropertyValues(owlObjectProperty))
			instance.removePropertyValue(owlObjectProperty, v);
	}

	public void removeValuesOfDatatypeProperty(OWLIndividual instance, String property) {
		OWLDatatypeProperty protegePropGet = model.getOWLDatatypeProperty(property);
	    for(Object v : instance.getPropertyValues(protegePropGet))
			instance.removePropertyValue(protegePropGet, v);
	}
}
