﻿/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe. 
**************************************************************************/
#include "PPro_API_Constants.jsx"

$._PPP_={

	exportAAF : function() {

		var name = app.project.name;
		var path = app.project.path.split(name)[0];
		var cleanname, seq, date, today, target, thisFile, render;

		if (path.match('04. Edit') == null){
			var renderFolder = new Folder;
			renderFolder = Folder.selectDialog("Choose Render Location");
			path = renderFolder;
		} else {
			path = path.split( '\\' ).slice( 0, -2 ).join( '\\' );
			path = path+'\\03. Audio\\05. AAF\\';
		}
		
		cleanname = name.split('.prproj')[0];
		seq = app.project.activeSequence.name;

		// format date
		date = new Date;
		today = date.getDate()+'-'+(date.getMonth()+1)+'-'+(date.getYear()+1900);

		//create folders
		var folder = new Folder(path+today+'\\PPP')
		if (!folder.exists){
		    folder.create()
		}
		target = new File(folder+'\\'+date.getHours()+'-'+date.getMinutes()+'_'+name);
		thisFile = new File (app.project.path);
		thisFile.copy(target);

		if (app.project.activeSequence){
			if (path) {

				var fullOutPath 	= path+seq;

				if (app.project.activeSequence.getOutPoint()>0) {render = 1}
					else {render = 2}
				app.encoder.encodeSequence(app.project.activeSequence, fullOutPath+'.mp4', 'Z:\\ART\\Recources\\Presets\\Ongoing Version.epr', render, 1);
				app.encoder.startBatch();

				app.project.exportAAF(	app.project.activeSequence,			// which sequence
										fullOutPath+'.aaf',					// output path
										0,									// mix down video?
										1,									// explode to mono?
										48000,								// sample rate
										16,									// bits per sample
										1,									// embed audio? 
										0,									// audio file format? 0 = aiff, 1 = wav
										1,									// trim sources? 
										500,
										/*,								// number of 'handle' frames
										''
										optionalPathToOutputPreset*/);		// optional; .epr file to use
			} else {
				$._PPP_.updateEventPanel("Couldn't create AAF output.");
			 }
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	dataToName : function () {
		app.enableQE()
		var clips = $._PPP_.getSelectedClips();
		var pos = []
		$._PPP_.forEachClip(clips, function(clip){
			var position = clip.components[1].properties[0].getValue();
			var rotation = clip.components[1].properties[4].getValue();
			var scale = clip.components[1].properties[1].getValue();
			clip.name += '_._._'+position+'_._._'+rotation+'_._._'+scale
		})
	},

	dragEnd : function () {
		var clips = $._PPP_.getSelectedClips();
		$._PPP_.forEachClip(clips, function(clip){
			clip.name = clip.name.split('_._._')[0]
		})
	},

	changePos : function (x,y) {
		var clips = $._PPP_.getSelectedClips();
		$._PPP_.forEachClip(clips, function(clip){
			var position = clip.name.split('_._._')[1].split(',');
			position[0] -= x;
			position[1] -= y;
			clip.components[1].properties[0].setValue(position, true)
		})
	},

	changeRot : function (y) {
		var clips = $._PPP_.getSelectedClips();
		$._PPP_.forEachClip(clips, function(clip){
			var rotation = clip.name.split('_._._')[2];
			rotation -= y;
			clip.components[1].properties[4].setValue(rotation, true)
		})
	},

	changeScl : function (y) {
		var clips = $._PPP_.getSelectedClips();
		$._PPP_.forEachClip(clips, function(clip){
			var scale = clip.name.split('_._._')[3];
			scale -= y;
			clip.components[1].properties[1].setValue(scale, true)
		})
	},

	scaleFootage : function(points, add){
		var clips = $._PPP_.getSelectedClips();
		// add to settings
		var s = points;
		if ( add != true ) s *= -1;
		$._PPP_.forEachClip(clips, function(clip){
			var scale = clip.components[1].properties[1].getValue();
			clip.components[1].properties[1].setValue((scale+s),1)
		})
	},

	selectLabel : function(){
		var clips = $._PPP_.getSelectedClips();
		labels = [];
		var lables = $._PPP_.forEachClip(clips, function(clip){
			var label = clip.projectItem.getColorLabel();
			labels.push(label);
		})
		var allClips = $._PPP_.getAllClips();
		$._PPP_.forEachClip(allClips, function(clip){
			label = clip.projectItem.getColorLabel()
			if (labels.join(',').match(label) != null) {
				clip.setSelected(1,1)
			}
		})
	},

	saveIncremental : function(){		
		var name = app.project.name;
		var cleanName = name.split('.prproj')[0];
		var path = app.project.path.split(name)[0];
		var newName = ''
		var suffix = ''

		// find current suffix
		 try {
		 	suffix = name.match(/(\d+)(?=[^\d]+$)/g)[0]
		    }

		 	// if there are no numbers in filename
		    catch (err){
		    	suffix = "01" ;
		    	newName = cleanName + '_01.prproj' ;
		    }
		// make sure numbers found are at the end of the filename
		if ( name.match ( suffix + '.prproj' ) != null) {
			cleanName = name.split(suffix +'.prproj')[0]
		    newSuffix = Number(suffix)+1;
		    newName = cleanName+zeroPad(newSuffix, suffix.length)+'.prproj';
		} else {
			newSuffix = "01" ;
		   	newName = cleanName + '_01.prproj' ;
		}

		var newFile = path+newName;
		var file = new File (newFile)

		    while (file.exists){
		    newSuffix++
		    newFile = path+cleanName+'_'+zeroPad(newSuffix, suffix.length)+'.prproj'
		    file = File (newFile)
		    }
		    
		 function zeroPad(n, s) { 
		   n = n.toString(); 
		   while (n.length < s)  n = '0' + n; 
		   return n; 
		}
		app.project.saveAs(newFile);
	},

	renderOngoing : function(){
		var name = app.project.name;
		var path = app.project.path.split(name)[0];

		if (path.match('04. Edit') == null){
			var renderFolder = new Folder;
			renderFolder = Folder.selectDialog("Choose Render Location");
			path = renderFolder;
		} else {
			path = path.split( '\\' ).slice( 0, -2 ).join( '\\' );
			path = path+'\\07. Render\\03. Ongoing Versions\\';
		}
		
		var cleanname = name.split('.')[0];
		var seq = app.project.activeSequence.name;

		// format date
		var date = new Date;
		var today = date.getDate()+'-'+(date.getMonth()+1)+'-'+(date.getYear()+1900);

		//create folders
		var folder = new Folder(path+today+'\\PPP')
		if (!folder.exists){
		    folder.create()
		}
		var target = new File(folder+'\\'+date.getHours()+'-'+date.getMinutes()+'_'+name);
		var thisFile = new File (app.project.path);
		thisFile.copy(target);
		var render = ''
		if (app.project.activeSequence.getOutPoint()>0) {render = 1}
			else {render = 2}
		app.encoder.encodeSequence(app.project.activeSequence, path+today+'\\'+cleanname+'_'+seq+'.mp4', 'Z:\\ART\\Recources\\Presets\\Ongoing Version.epr', render, 1);
		app.encoder.startBatch();

	},

	renderMaster : function(){
		conf = confirm ("Are you sure it's time for a master render? This is a big deal. Ask Tamar.", false, 'Master files are serious.');
		if (conf == true){
			var actSeq = app.project.activeSequence;
			var ip = actSeq.getInPoint();
			var op = actSeq.getOutPoint();
			op = op-ip;
		    var prop = actSeq.getSettings();
			var duration = Math.round(op);
			var x = prop.videoFrameWidth;
			var y = prop.videoFrameHeight;

			var name = app.project.name;
			var path = app.project.path.split(name)[0];

			if (path.match('04. Edit') == null){
				var renderFolder = new Folder;
				renderFolder = Folder.selectDialog("Choose Render Location");
				path = renderFolder;
			} else {
				path = path.split( '\\' ).slice( 0, -2 ).join( '\\' );
				path = path+'\\07. Render\\04. Master\\';
			}

			var cleanname = name.split('.')[0];
			var seq = app.project.activeSequence.name;

			// format date
			var date = new Date;
			var today = date.getDate()+'-'+(date.getMonth()+1)+'-'+(date.getYear()+1900);

			//create folders
			var folder = new Folder(path+'\\PPP')
			if (!folder.exists){
			    folder.create()
			}
			var target = new File(folder+'\\'+date.getHours()+'-'+date.getMinutes()+'_'+name);
			var thisFile = new File (app.project.path);
			thisFile.copy(target);
			app.encoder.encodeSequence(app.project.activeSequence, path+seq+'_'+x+'_'+y+'_'+duration+'SEC.mov', 'Z:\\ART\\Recources\\Presets\\Master Render.epr', 1, 0);
			app.encoder.startBatch();
		}
	},

	getRatio : function(){
		var actSeq = app.project.activeSequence;
		var prop = actSeq.getSettings();
		var x = prop.videoFrameWidth;
		var y = prop.videoFrameHeight;
		var ratio = x / y;
		$.writeln(ratio)
	return ratio
	},

	findOutros : function(){
		var ar = [];
		var csInterface = new CSInterface();
		var folder = Folder('Z:/ART/Assets/2. Video/3. Outro/');
		var outros = folder.getFiles();
		for (i=0; i<outros.length; i++) ar.push(decodeURI (outros[i].name));
		return outros;
	},

	getStyleSheet : function(cssName, rule){
	    for (i = 0; i < document.styleSheets.length; i++) {
	        if (document.styleSheets[i].href.toString().indexOf(cssName) != -1)
	            for (x = 0; x < document.styleSheets[i].rules.length; x++) {
	                if (document.styleSheets[i].rules[x].selectorText.toString().indexOf(rule) != -1)
	                    return document.styleSheets[i].rules[x];
	            }

	    }

	    return null;
	},

	resetFootage : function(hd){
		var x = app.project.activeSequence.frameSizeHorizontal;
		var y = app.project.activeSequence.frameSizeVertical;
		var collection = $._PPP_.getSelectedClips()
		$._PPP_.forEachClip(collection, function(clip){
			var props = clip.components[1].properties,
				rot = props[4].getValue()

			if (hd == "fit") {
				hd = $._PPP_.scaleToFrame(clip)[0]
			}
			if (hd == "fill") {
				hd = $._PPP_.scaleToFrame(clip)[1]
			}
			
		    props[0].setValue([0.5,0.5]);
		    props[1].setValue(hd, true);
		    if (rot % 90 != 0 ) props[4].setValue(0, 1)
		    	
		})
	},

	scaleToFrame : function(clip){
		var dimensions = clip.projectItem.getProjectMetadata().split('<premierePrivateProjectMetaData:Column.Intrinsic.VideoInfo>')[1].split('(')[0].split(' x '),
			rot = clip.components[1].properties[4].getValue(),
			x = dimensions[0],
			y = dimensions[1],
			frameX = app.project.activeSequence.frameSizeHorizontal,
			frameY = app.project.activeSequence.frameSizeVertical,
			scaleRatio

		if ( rot % 90 == 0 && rot % 180 != 0) y = [x, x = y][0]

		scaleRatio = [frameX/x*100, frameY/y*100].sort()
		return scaleRatio

	},

	rotateMulticams : function(){
	    collection = $._PPP_.getLabel(5);
	    $._PPP_.forEachClip(collection, function(clip){
	    var props = clip.components[1].properties;
	    	props[0].setValue([0.5,0.5]);
	    	props[1].setValue(50);
	    	props[4].setValue(90,1);
	    })
	},

	rotateFootage : function(clips, add){
	    collection = clips;
	    $._PPP_.forEachClip(collection, function(clip){
		    var props = clip.components[1].properties;
		    var rot = props[4].getValue();
		    rot += add;
	    	props[4].setValue(rot,true);
	    })
	},

	rotateAdjustments : function(){
	    collection = $._PPP_.getLabel(3);
	    $._PPP_.forEachClip(collection, function(clip){
	    var props = clip.components[1].properties;
    	props[4].setValue(90,1);
	    })
	},

	makeId : function(){
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < 5; i++){
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	},

	duplicate : function(width, height, size){
		var name = app.project.activeSequence.name;
		app.project.activeSequence.clone();
		app.project.activeSequence.name = name+size;
		$._PPP_.setCompSize(width, height);
	},

	getSelectedClips : function(){
		var tracks = app.project.activeSequence.videoTracks,
		    collection = [];

	    for ( var a=0 ; a< tracks.numTracks ; a++){
	        var trackItems = tracks[a].clips;
	        for ( var i=0 ; i< trackItems.numItems ; i++){

	            var currentClip = trackItems[i];
	            if( trackItems[i].isSelected() ) {
	                collection.push( trackItems[i] )
	            }                
	        }
	    }
	    return collection
	},

	getLabel : function (label) {
		var tracks = app.project.activeSequence.videoTracks,
		    collection = [];

	    for ( var a=0 ; a< tracks.numTracks ; a++){
	        var trackItems = tracks[a].clips;
	        for ( var i=0 ; i< trackItems.numItems ; i++){

	            var currentLabel = trackItems[i].projectItem.getColorLabel();
	            if( currentLabel == label ){
	                collection.push( trackItems[i] )
	            }                
	        }
	    }
	    return collection
	},

	getAllClips : function () {
		var tracks = app.project.activeSequence.videoTracks,
		    collection = [];

	    for ( var a=0 ; a< tracks.numTracks ; a++){
	        var trackItems = tracks[a].clips;
	        for ( var i=0 ; i< trackItems.numItems ; i++){

	            var currentClip = trackItems[i];
	                collection.push( trackItems[i] )                        
	        }
	    }
	    return collection
	},

	forEachClip : function(targetClips, doSomething){
	    for ( var a = 0 ; a < targetClips.length ; a++){
	        doSomething(targetClips[a]);
	    }
	},

	makePortrait : function () {
		$._PPP_.duplicate(1080, 1920, "_Portrait(Converted)")
		var adjusments = $._PPP_.getLabel(3),
			footage = $._PPP_.getLabel(5).concat(adjusments)

		$._PPP_.forEachClip(footage, function (clip) {
			clip.components[1].properties[4].setValue(90, true);
		})
	},

	setCompSize : function(width, height){
	    var actSeq = app.project.activeSequence;
	    var tracks = actSeq.videoTracks;
	    var prop = actSeq.getSettings();
	    prop.videoFrameWidth = width;
	    prop.videoFrameHeight = height;
	    actSeq.setSettings(prop)
	},

	markOutro : function(){

	    var actSeq = app.project.activeSequence;
	    var selectedClips = $._PPP_.getSelectedClips();
	    var i = selectedClips.length;

	    nothingSelected = [
	        "Please select the outro to mark it for replacement.",
	        "No clip selected"
	    ];
	    tooManySelected = [
	        "You have "+i+
	        " clips selected. The last will be marked as outro. Continue?",
	        "Too many dicks on the dancefloor"
	    ];
	    
	    if ( i < 1 ){
	        alert (nothingSelected[0], nothingSelected[1], false);
	        }
	    else if( i == 1 || confirm (tooManySelected[0], true, tooManySelected[1])){
	        var start                   				= selectedClips[i-1].start.seconds;
	        var end                     				= selectedClips[i-1].end.seconds;
	        var newMarker               				= actSeq.markers.createMarker(start);
	        newMarker.name              				= 'outro';
	        newMarker.end               				= end;
	        newMarker.setTypeAsChapter();

	         if( end < actSeq.end/254016000000 ){
	            var newClearMarker                		= actSeq.markers.createMarker(end);
	            newClearMarker.name               		= 'clear';
	            newClearMarker.end                		= end+1;
	            newClearMarker.setTypeAsChapter();
	            }
	    } 
	},

	createDeepFolderStructure : function(foldersArray, maxDepth) {
		if (typeof foldersArray !== 'object' || foldersArray.length <= 0) {
			throw new Error('No valid folders array was provided!');
		}

		// if the first folder already exists, throw error
		for (var i = 0; i < app.project.rootItem.children.numItems; i++) {
			var curChild = app.project.rootItem.children[i];
			if (curChild.type === ProjectItemType.BIN && curChild.name === foldersArray[0]) {
				throw new Error('Folder with name "' + curChild.name + '" already exists!');
			}
		}

		// create the deep folder structure
		var currentBin = app.project.rootItem.createBin(foldersArray[0]);
		for (var m = 1; m < foldersArray.length && m < maxDepth; i++) {
			currentBin = currentBin.createBin(foldersArray[i]);
		}
	},

	getVersionInfo : function() {
		return 'PPro ' + app.version + 'x' + app.build;
	},

	getUserName : function() {
		var	homeDir		= new File('~/');
		var	userName	= homeDir.displayName;
		homeDir.close();
		return userName;
	},

	keepPanelLoaded : function() {
		app.setExtensionPersistent("com.adobe.PProPanel", 0); // 0, while testing (to enable rapid reload); 1 for "Never unload me, even when not visible."
	},

	updateGrowingFile : function() {
		var numItems	= app.project.rootItem.children.numItems;
		for (var i = 0; i < numItems; i++){
			var currentItem = app.project.rootItem.children[i];
			if (currentItem){
				currentItem.refreshMedia();
			}
		}
	},

	getSep : function() {
		if (Folder.fs == 'Macintosh') {
			return '/';
		} else {
			return '\\';
		}
	},

	saveProject : function() {
		app.project.save();
	},

	exportCurrentFrameAsPNG : function() {
		app.enableQE();
		var activeSequence	= qe.project.getActiveSequence(); 	// note: make sure a sequence is active in PPro UI
		if (activeSequence) {
			// Create a file name based on timecode of frame.
			var time			= activeSequence.CTI.timecode; 	// CTI = Current Time Indicator.
			var removeThese 	= /:|;/ig;    // Why? Because Windows chokes on colons.
			var safeTimeStr         = time.replace(removeThese, '_');
			var outputPath		= new File("~/Desktop");
			var outputFileName	= outputPath.fsName + $._PPP_.getSep() + safeTimeStr + '___' + activeSequence.name;
			activeSequence.exportFramePNG(time, outputFileName);
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	renameFootage : function() {
		var item = app.project.rootItem.children[0]; // assumes the zero-th item in the project is footage.
		if (item) {
			item.name = item.name + ", updated by PProPanel.";
		} else {
			$._PPP_.updateEventPanel("No project items found.");
		}
	},

	getActiveSequenceName : function() {
		if (app.project.activeSequence) {
			return app.project.activeSequence.name;
		} else {
			return "No active sequence.";
		}
	},
	
	projectPanelSelectionChanged : function(projectItems, viewID) {
		
		var remainingArgs 	= projectItems.length;
		var message			= "";

		if (remainingArgs){
			var message 		= remainingArgs + " items selected: ";
			var view 			= viewID;
			
			// Concatenate selected project item names, into message. 
			for (var i = 0; i < projectItems.length; i++) {
				message += projectItems[i].name;
				remainingArgs--;
				if (remainingArgs > 1) {
					message += ', ';
				}
				if (remainingArgs === 1){
					message += ", and ";
				} 
				if (remainingArgs === 0) {
					message += ".";
				}
			}
		} else {
			message = '0 items selected.';
		}
		app.setSDKEventMessage(message, 'info');
	},

	registerProjectPanelSelectionChangedFxn : function() {
//~ 		var success = app.bind("onSourceClipSelectedInProjectPanel", $._PPP_.projectPanelSelectionChanged);
	},

	saveCurrentProjectLayout : function() {
		var currentProjPanelDisplay = app.project.getProjectPanelMetadata();
		if (currentProjPanelDisplay){
			var outFileName			= 'Previous_Project_Panel_Display_Settings.xml';
			var actualProjectPath	= new File(app.project.path);
			var projDir 			= actualProjectPath.parent;
			if (actualProjectPath){
				var completeOutputPath	= projDir +  $._PPP_.getSep() + outFileName;
				var outFile				= new File(completeOutputPath);
				if (outFile){
					outFile.encoding = "UTF8";
					outFile.open("w", "TEXT", "????");
					outFile.write(currentProjPanelDisplay);
					$._PPP_.updateEventPanel("Saved layout to next to the project.");
					outFile.close();
				}
				actualProjectPath.close();
			}
		} else {
			$._PPP_.updateEventPanel("Could not retrieve current project layout.");
		}
	},

	setProjectPanelMeta : function() {
		var filterString = "";
		if (Folder.fs === 'Windows'){
			filterString = "XML files:*.xml";
		}
		var fileToOpen = File.openDialog (	"Choose Project panel layout to open.", 
											filterString, 
											false);
		if (fileToOpen) {
			if (fileToOpen.fsName.indexOf('.xml')){ // We should really be more careful, but hey, it says it's XML!
				fileToOpen.encoding = "UTF8";
				fileToOpen.open("r", "TEXT", "????");
				var fileContents = fileToOpen.read();
				if (fileContents){
					var setResult = app.project.setProjectPanelMetadata(fileContents);
					if (setResult){
						$._PPP_.updateEventPanel("Could not update layout using " + fileToOpen.filename + ".");		
					} else {
						$._PPP_.updateEventPanel("Updated layout from .xml file.");	
					}
				}
			}
		} else {
			$._PPP_.updateEventPanel("No valid layout file chosen.");		
		}
	},

	exportSequenceAsPrProj : function() {
		var activeSequence = app.project.activeSequence;
		if (activeSequence) {
			var startTimeOffset		= activeSequence.zeroPoint;  
			var prProjExtension		= '.prproj';
			var outputName			= activeSequence.name;
			var outFolder			= Folder.selectDialog();
		
			if (outFolder) {
				var completeOutputPath =	outFolder.fsName + 
											$._PPP_.getSep() +
											outputName +
											prProjExtension;
			
				app.project.activeSequence.exportAsProject(completeOutputPath);
		
				$._PPP_.updateEventPanel("Exported " + app.project.activeSequence.name + " to " +completeOutputPath + ".");
			} else {
				$._PPP_.updateEventPanel("Could not find or create output folder.");
			}

			// Here's how to import N sequences from a project.
			//
			// var seqIDsToBeImported = new Array;
			// seqIDsToBeImported[0] = ID1;
			// ...
			// seqIDsToBeImported[N] = IDN;
			//
			//app.project.importSequences(pathToPrProj, seqIDsToBeImported);
			
		}else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	createSequenceMarkers : function() {
		var activeSequence = app.project.activeSequence;
		if (activeSequence) {
			var markers		= activeSequence.markers; 
			if (markers) {
				var numMarkers	= markers.numMarkers;
				if (numMarkers > 0) {
					var marker_index = 1;
					for(var current_marker	=	markers.getFirstMarker();
							current_marker	!==	undefined; 
							current_marker	=	markers.getNextMarker(current_marker)){
						if (current_marker.name !== "") {
							$._PPP_.updateEventPanel(	'Marker ' + marker_index + ' name = ' + current_marker.name + '.');
						} else {
							$._PPP_.updateEventPanel(	'Marker ' + marker_index + ' has no name.');
						}

						if (current_marker.end.seconds > 0) {
							$._PPP_.updateEventPanel(	'Marker ' + marker_index + ' duration = ' + (current_marker.end.seconds - current_marker.start.seconds) + ' seconds.');
						} else {
							$._PPP_.updateEventPanel(	'Marker ' + marker_index + ' has no duration.');
						}
						$._PPP_.updateEventPanel('Marker ' + marker_index + ' starts at ' + current_marker.start.seconds + ' seconds.');
						marker_index = marker_index + 1;
					}
				}
			}
	
			var newCommentMarker			= markers.createMarker(12.345);
			newCommentMarker.name			= 'Marker created by PProPanel.';
			newCommentMarker.comments		= 'Here are some comments, inserted by PProPanel.';
			newCommentMarker.end			= 15.6789;

			var newWebMarker				= markers.createMarker(14.345);
			newWebMarker.name				= 'Web marker created by PProPanel.';
			newWebMarker.comments			= 'Here are some comments, inserted by PProPanel.';
			newWebMarker.end				= 17.6789;
			newWebMarker.setTypeAsWebLink("http://www.adobe.com", "frame target");
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},
	
	exportFCPXML : function() {
		if (app.project.activeSequence) {
			var projPath			= new File(app.project.path);
			var parentDir			= projPath.parent;
			var outputName			= app.project.activeSequence.name;
			var xmlExtension		= '.xml';
			var outputPath			= Folder.selectDialog("Choose the output directory");
		
			if (outputPath) {
				var completeOutputPath = outputPath.fsName + $._PPP_.getSep() + outputName + xmlExtension;
				app.project.activeSequence.exportAsFinalCutProXML(completeOutputPath, 1); // 1 == suppress UI
				var info = 	"Exported FCP XML for " + 
							app.project.activeSequence.name + 
							" to " + 
							completeOutputPath + 
							".";
				$._PPP_.updateEventPanel(info);
			} else {
				$._PPP_.updateEventPanel("No output path chosen.");
			}
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	openInSource : function() {
		var filterString = "";
		if (Folder.fs === 'Windows'){
			filterString = "All files:*.*";
		}
		var fileToOpen = File.openDialog (	"Choose file to open.", 
											filterString, 
											false);
		if (fileToOpen) {
			app.sourceMonitor.openFilePath(fileToOpen.fsName);
			app.sourceMonitor.play(1.73); // playback speed as float, 1.0 = normal speed forward
			var position = app.sourceMonitor.getPosition(); // new in 13.0
			$._PPP_.updateEventPanel("Current Source monitor position: " + position.seconds + " seconds.");		
			fileToOpen.close(); 
		} else {
			$._PPP_.updateEventPanel("No file chosen.");		
		}
	},

	searchForBinWithName : function (nameToFind) {
		// deep-search a folder by name in project
		var deepSearchBin = function(inFolder) {
		  if (inFolder && inFolder.name === nameToFind && inFolder.type === 2) {
			return inFolder;
		  } else {
			for (var i = 0; i < inFolder.children.numItems; i++) {
			  if (inFolder.children[i] && inFolder.children[i].type === 2) {
				var foundBin = deepSearchBin(inFolder.children[i]);
				if (foundBin) return foundBin;
			  }
			}
		  }
		  return undefined;
		};
		return deepSearchBin(app.project.rootItem);
	},

	importFiles : function() {
		var filterString = "";
		if (Folder.fs === 'Windows'){
			filterString = "All files:*.*";
		}
		if (app.project) {
			var fileOrFilesToImport	= File.openDialog (	"Choose files to import", 	// title
														filterString,				// filter available files? 
														true); 						// allow multiple?
			if (fileOrFilesToImport) {
				// We have an array of File objects; importFiles() takes an array of paths.
				var importThese = [];
				if (importThese){
					for (var i = 0; i < fileOrFilesToImport.length; i++) {
						importThese[i] = fileOrFilesToImport[i].fsName;
					}
					app.project.importFiles(importThese, 
											1,				// suppress warnings 
											app.project.getInsertionBin(),
											0);				// import as numbered stills
				}
			} else {
				$._PPP_.updateEventPanel("No files to import.");
			} 
		}
	},

	muteFun : function() {
		if (app.project.activeSequence){
			for (var i = 0; i < app.project.activeSequence.audioTracks.numTracks; i++){
				var currentTrack	= app.project.activeSequence.audioTracks[i];
				if (Math.random() > 0.5){
					currentTrack.setMute(!(currentTrack.isMuted()));
				 }
			}
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	disableImportWorkspaceWithProjects : function() {
		var prefToModify	= 'FE.Prefs.ImportWorkspace';
		var appProperties 	= app.properties;
		
		if (appProperties){
			var propertyExists 		= app.properties.doesPropertyExist(prefToModify);
			var propertyIsReadOnly 	= app.properties.isPropertyReadOnly(prefToModify);
			var propertyValue 		= app.properties.getProperty(prefToModify);
		
//~ 			appProperties.setProperty(prefToModify, false, 1); // optional 3rd param : 0 = non-persistent,  1 = persistent (default)
			var safetyCheck = app.properties.getProperty(prefToModify);
			if (safetyCheck != propertyValue){
				$._PPP_.updateEventPanel("Changed \'Import Workspaces with Projects\' from " + propertyValue + " to " + safetyCheck + ".");
			}
		} else {
			$._PPP_.updateEventPanel("Properties not found.");
		}
	},

	turnOffStartDialog : function (){
		var prefToModify	= 'MZ.Prefs.ShowQuickstartDialog';
		var appProperties 	= app.properties;
		if (appProperties){
			var propertyExists 		= app.properties.doesPropertyExist(prefToModify);
			var propertyIsReadOnly 	= app.properties.isPropertyReadOnly(prefToModify);
			var originalValue 		 = app.properties.getProperty(prefToModify);
		
			appProperties.setProperty(prefToModify, false, 1, 1); // optional 4th param : 0 = non-persistent,  1 = persistent (default)
			var safetyCheck = app.properties.getProperty(prefToModify);
			if (safetyCheck != originalValue){
				$._PPP_.updateEventPanel("Start dialog now OFF. Enjoy!");
			} else {
				$._PPP_.updateEventPanel("Start dialog was already OFF.");
			}
		} else {
			$._PPP_.updateEventPanel("Properties not found.");
		}
	},

	replaceMedia : function() {
		
		// 	Note: 	This method of changing paths for projectItems is from the time
		//			before PPro supported full-res AND proxy paths for each projectItem. 
		//			This can still be used, and will change the hi-res projectItem path, but
		//			if your panel supports proxy workflows, it should rely instead upon
		//			projectItem.setProxyPath() instead. 

		var firstProjectItem = app.project.rootItem.children[0]; 
		if (firstProjectItem) {
			if (firstProjectItem.canChangeMediaPath()) {
			
				// 	NEW in 9.0: setScaleToFrameSize() ensures that for all clips created from this footage, 
				//	auto scale to frame size will be ON, regardless of the current user preference. 
				//	This is	important for proxy workflows, to avoid mis-scaling upon replacement. 

				//	Addendum: This setting will be in effect the NEXT time the projectItem is added to a 
				//	sequence; it will not affect or reinterpret clips from this projectItem, already in
				//	sequences.

				firstProjectItem.setScaleToFrameSize();
				var filterString = "";
				if (Folder.fs === 'Windows'){
					filterString = "All files:*.*";
				}
				var replacementMedia = File.openDialog(	"Choose new media file, for " + 
														firstProjectItem.name, 
														filterString,			// file filter
														false); 				// allow multiple?
				
				if (replacementMedia) {
					var suppressWarnings	= true;
					firstProjectItem.name	= replacementMedia.name + ", formerly known as " + firstProjectItem.name;
					firstProjectItem.changeMediaPath(replacementMedia.fsName, suppressWarnings);  // new in 12.1
					replacementMedia.close(); 
				} 
			} else {
				$._PPP_.updateEventPanel("Couldn't change path of " + firstProjectItem.name + ".");
			}
		} else {
			$._PPP_.updateEventPanel("No project items found.");
		}
	},
	
	openProject : function() {
		var filterString = "";
		if (Folder.fs === 'Windows'){
			filterString = "Premiere Pro project files:*.prproj";
		}
		var projToOpen	= File.openDialog (	"Choose project:", 
											filterString, 
											false);
		if ((projToOpen) && projToOpen.exists) {
			app.openDocument(	projToOpen.fsName,
								1,					// suppress 'Convert Project' dialogs?
								1,					// suppress 'Locate Files' dialogs?
								1);					// suppress warning dialogs?
			projToOpen.close();
		}	
	},

	exportFramesForMarkers : function (){
		app.enableQE();
		var activeSequence = app.project.activeSequence;
		if (activeSequence) {
			var markers			= activeSequence.markers; 
			var markerCount		= markers.numMarkers;
			if (markerCount){
				var firstMarker = markers.getFirstMarker();
				activeSequence.setPlayerPosition(firstMarker.start.ticks);
				$._PPP_.exportCurrentFrameAsPNG();

				var previousMarker = 0; 
				if (firstMarker){
					for(var i = 0; i < markerCount; i++){
						if (i === 0){
							currentMarker = markers.getNextMarker(firstMarker);
						} else {
							currentMarker = markers.getNextMarker(previousMarker);
						}
						if (currentMarker){
							activeSequence.setPlayerPosition(currentMarker.start.ticks);
							previousMarker = currentMarker;
							$._PPP_.exportCurrentFrameAsPNG();
						}
					}
				}
			} else {
				$._PPP_.updateEventPanel("No markers applied to " + activeSequence.name + ".");
			}
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	createSequence : function(name) {
		var someID	= "xyz123";
		var seqName = prompt('Name of sequence?',	 '<<<default>>>', 'Sequence Naming Prompt');
		app.project.createNewSequence(seqName, someID);
	},

	createSequenceFromPreset : function(presetPath) {
		app.enableQE();
		var seqName = prompt('Name of sequence?',	 '<<<default>>>', 'Sequence Naming Prompt');
		if (seqName) {
			qe.project.newSequence(seqName, presetPath);
		}
	},

	transcode : function(outputPresetPath) {
        app.encoder.bind('onEncoderJobComplete',	$._PPP_.onEncoderJobComplete);		
		app.encoder.bind('onEncoderJobError', 		$._PPP_.onEncoderJobError);
		app.encoder.bind('onEncoderJobProgress', 	$._PPP_.onEncoderJobProgress);
		app.encoder.bind('onEncoderJobQueued', 		$._PPP_.onEncoderJobQueued);
		app.encoder.bind('onEncoderJobCanceled',	$._PPP_.onEncoderJobCanceled);

		var projRoot = app.project.rootItem.children;

		if (projRoot.numItems){
			var firstProjectItem = app.project.rootItem.children[0];
			if (firstProjectItem){

				app.encoder.launchEncoder();	// This can take a while; let's get the ball rolling.
		
				var fileOutputPath	= Folder.selectDialog("Choose the output directory");
				if (fileOutputPath){
					var outputName	= firstProjectItem.name.search('[.]');
					if (outputName == -1){
						outputName	= firstProjectItem.name.length;
					}
					outFileName	= firstProjectItem.name.substr(0, outputName);
					outFileName	= outFileName.replace('/', '-');
					var completeOutputPath	= fileOutputPath.fsName + $._PPP_.getSep() + outFileName + '.mxf';
					var removeFromQueue		= true;
					var rangeToEncode		= app.encoder.ENCODE_IN_TO_OUT;
					app.encoder.encodeProjectItem(	firstProjectItem, 
													completeOutputPath, 
													outputPresetPath, 
													rangeToEncode, 
													removeFromQueue); 
					app.encoder.startBatch();
				}
			} else {
				$._PPP_.updateEventPanel("No project items found.");
			}
		} else {
			$._PPP_.updateEventPanel("Project is empty.");
		}
	},

	transcodeExternal : function (outputPresetPath){
		app.encoder.launchEncoder();
		var filterString = "";
		if (Folder.fs === 'Windows'){
			filterString = "All files:*.*";
		}
		var fileToTranscode = File.openDialog (	"Choose file to open.", 
												filterString, 
												false);
		if (fileToTranscode) {
			var fileOutputPath = Folder.selectDialog("Choose the output directory");
			if (fileOutputPath){

				var srcInPoint		= 1.0; 	// encode start time at 1s (optional--if omitted, encode entire file)
				var srcOutPoint		= 3.0; // encode stop time at 3s (optional--if omitted, encode entire file)
				var removeFromQueue	= false;

				var result = app.encoder.encodeFile(fileToTranscode.fsName, 
													fileOutputPath.fsName, 
													outputPresetPath, 
													removeFromQueue, 
													srcInPoint, 
													srcOutPoint);
			}
		}
	},

	render : function(outputPresetPath) {
		app.enableQE();
		var activeSequence = qe.project.getActiveSequence();	// we use a QE DOM function, to determine the output extension.
		if (activeSequence)	{
			app.encoder.launchEncoder();	// This can take a while; let's get the ball rolling.

			var timeSecs	= activeSequence.CTI.secs;		// Just for reference, here's how to access the CTI 
			var timeFrames	= activeSequence.CTI.frames;	// (Current Time Indicator), for the active sequence. 
			var timeTicks	= activeSequence.CTI.ticks;
			var timeString	= activeSequence.CTI.timecode;

			var seqInPoint	= app.project.activeSequence.getInPoint();	// new in 9.0
			var seqOutPoint	= app.project.activeSequence.getOutPoint();	// new in 9.0

			var seqInPointAsTime = app.project.activeSequence.getInPointAsTime();	// new in 12.0
			var seqOutPointAsTime = app.project.activeSequence.getOutPointAsTime(); // new in 12.0
			
			var projPath	= new File(app.project.path);
			var outputPath  = Folder.selectDialog("Choose the output directory");

			if ((outputPath) && projPath.exists){
				var outPreset		= new File(outputPresetPath);
				if (outPreset.exists === true){
					var outputFormatExtension		=	activeSequence.getExportFileExtension(outPreset.fsName);
					if (outputFormatExtension){
						var outputFilename	= 	activeSequence.name + '.' + outputFormatExtension;

						var fullPathToFile	= 	outputPath.fsName 	+ 
												$._PPP_.getSep() 	+ 
												activeSequence.name + 
												"." + 
												outputFormatExtension;			

						var outFileTest = new File(fullPathToFile);

						if (outFileTest.exists){
							var destroyExisting	= confirm("A file with that name already exists; overwrite?", false, "Are you sure...?");
							if (destroyExisting){
								outFileTest.remove();
								outFileTest.close();
							}
						}

						app.encoder.bind('onEncoderJobComplete',	$._PPP_.onEncoderJobComplete);
						app.encoder.bind('onEncoderJobError', 		$._PPP_.onEncoderJobError);
						app.encoder.bind('onEncoderJobProgress', 	$._PPP_.onEncoderJobProgress);
						app.encoder.bind('onEncoderJobQueued', 		$._PPP_.onEncoderJobQueued);
						app.encoder.bind('onEncoderJobCanceled',	$._PPP_.onEncoderJobCanceled);


						// use these 0 or 1 settings to disable some/all metadata creation.

						app.encoder.setSidecarXMPEnabled(0);
						app.encoder.setEmbeddedXMPEnabled(0);

						/* 

						For reference, here's how to export from within PPro (blocking further user interaction).
						
						var seq = app.project.activeSequence; 
						
						if (seq) {
							seq.exportAsMediaDirect(fullPathToFile,  
													outPreset.fsName, 
													app.encoder.ENCODE_WORKAREA);

							Bonus: Here's how to compute a sequence's duration, in ticks. 254016000000 ticks/second.
							var sequenceDuration = app.project.activeSequence.end - app.project.activeSequence.zeroPoint;						
						}
						
						*/
						
						var jobID = app.encoder.encodeSequence(	app.project.activeSequence,
																fullPathToFile,
																outPreset.fsName,
																app.encoder.ENCODE_WORKAREA, 
																1);	   // Remove from queue upon successful completion?					
						$._PPP_.updateEventPanel('jobID = ' + jobID);
						outPreset.close();
					}
				} else {
					$._PPP_.updateEventPanel("Could not find output preset.");
				}
			} else {
				$._PPP_.updateEventPanel("Could not find/create output path.");
			}
			projPath.close();
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	saveProjectCopy : function() {
		var sessionCounter	= 1;
		var originalPath	= app.project.path;
		var outputPath		= Folder.selectDialog("Choose the output directory");

		if (outputPath) {
			var absPath		= outputPath.fsName;
			var outputName	= String(app.project.name);
			var array		= outputName.split('.', 2);

			outputName = array[0]+ sessionCounter + '.' + array[1]; 
			sessionCounter++;

			var fullOutPath = absPath + $._PPP_.getSep() + outputName;

			app.project.saveAs(fullOutPath);

			for (var a = 0; a < app.projects.numProjects; a++){ 
				var currentProject = app.projects[a]; 
				if (currentProject.path === fullOutPath){ 
					app.openDocument(originalPath);		// Why first? So we don't frighten the user by making PPro's window disappear. :)
					currentProject.closeDocument(); 
				} 
			}
		} else {
			$._PPP_.updateEventPanel("No output path chosen.");
		}
	},

	mungeXMP : function(){
		var projectItem	= app.project.rootItem.children[0]; // assumes first item is footage.
		if (projectItem) {
			if (ExternalObject.AdobeXMPScript === undefined) {
				ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); 
			}
			if (ExternalObject.AdobeXMPScript !== undefined) { 	// safety-conscious!
				
				var xmpBlob					= projectItem.getXMPMetadata();
				var xmp						= new XMPMeta(xmpBlob);
				var oldSceneVal				= "";
				var oldDMCreatorVal 		= "";

				if (xmp.doesPropertyExist(XMPConst.NS_DM, "scene") === true){
					var myScene = xmp.getProperty(XMPConst.NS_DM, "scene");
					oldSceneVal	= myScene.value;
				}
				
				if (xmp.doesPropertyExist(XMPConst.NS_DM, "creator") === true){
					var myCreator = xmp.getProperty(XMPConst.NS_DM, "creator");
					oldCreatorVal	= myCreator.value;
				}

				// Regardless of whether there WAS scene or creator data, set scene and creator data. 

				xmp.setProperty(XMPConst.NS_DM, "scene",	oldSceneVal 	+ " Added by PProPanel sample!");
				xmp.setProperty(XMPConst.NS_DM, "creator",	oldDMCreatorVal + " Added by PProPanel sample!");

				// That was the NS_DM creator; here's the NS_DC creator.

				var creatorProp             = "creator";
				var containsDMCreatorValue  = xmp.doesPropertyExist(XMPConst.NS_DC, creatorProp);
				var numCreatorValuesPresent = xmp.countArrayItems(XMPConst.NS_DC, creatorProp);
				var CreatorsSeparatedBy4PoundSigns = "";

				if(numCreatorValuesPresent > 0) {
					for (var z = 0; z < numCreatorValuesPresent; z++){
						CreatorsSeparatedBy4PoundSigns = CreatorsSeparatedBy4PoundSigns + xmp.getArrayItem(XMPConst.NS_DC, creatorProp, z + 1);
						CreatorsSeparatedBy4PoundSigns = CreatorsSeparatedBy4PoundSigns + "####";
					}
					$._PPP_.updateEventPanel(CreatorsSeparatedBy4PoundSigns);

					if (confirm("Replace previous?", false, "Replace existing Creator?")) {
						xmp.deleteProperty(XMPConst.NS_DC, "creator");
					}
					xmp.appendArrayItem(XMPConst.NS_DC, // If no values exist, appendArrayItem will create a value.
										creatorProp,
										numCreatorValuesPresent + " creator values were already present.",
										null, 
										XMPConst.ARRAY_IS_ORDERED);

				} else {
					
					xmp.appendArrayItem(XMPConst.NS_DC, 
										creatorProp,
										"PProPanel wrote the first value into NS_DC creator field.",
										null, 
										XMPConst.ARRAY_IS_ORDERED);
				}
				var xmpAsString = xmp.serialize();			// either way, serialize and write XMP.
				projectItem.setXMPMetadata(xmpAsString);
			}
		} else {
			$._PPP_.updateEventPanel("Project item required.");
		}
	},
	
	getProductionByName : function(nameToGet) {
		var production;
		for (var i = 0; i < productionList.numProductions; i++) {
			var currentProduction = productionList[i];

			if (currentProduction.name == nameToGet) {
				production = currentProduction;
			}
		}
		return production;
	},

	pokeAnywhere : function() {
		var token				= app.anywhere.getAuthenticationToken();
		var productionList		= app.anywhere.listProductions();
		var isProductionOpen	= app.anywhere.isProductionOpen();
		if (isProductionOpen === true) {
			var sessionURL			= app.anywhere.getCurrentEditingSessionURL();
			var selectionURL		= app.anywhere.getCurrentEditingSessionSelectionURL();
			var activeSequenceURL	= app.anywhere.getCurrentEditingSessionActiveSequenceURL();

			var theOneIAskedFor = $._PPP_.getProductionByName("test");

			if (theOneIAskedFor) {
				var out	= theOneIAskedFor.name + ", " + theOneIAskedFor.description;
				$._PPP_.updateEventPanel("Found: " + out);	// todo: put useful code here.
			}
		} else {
			$._PPP_.updateEventPanel("No Production open.");
		}
	},

	dumpOMF : function() {
		var activeSequence	= app.project.activeSequence;
		if (activeSequence) {
			var outputPath	= Folder.selectDialog("Choose the output directory");
			if (outputPath){
				var absPath				= outputPath.fsName;
				var outputName			= String(activeSequence.name) + '.omf';
				var fullOutPathWithName = absPath + $._PPP_.getSep() + outputName;

				app.project.exportOMF(	app.project.activeSequence,		// sequence
										fullOutPathWithName, 		// output file path
										'OMFTitle',						// OMF title
										48000,							// sample rate (48000 or 96000)
										16,								// bits per sample (16 or 24)
										1,								// audio encapsulated flag (1 : yes or 0 : no)
										0,								// audio file format (0 : AIFF or 1 : WAV)
										0,								// trim audio files (0 : no or 1 : yes)
										0,								// handle frames (if trim is 1, handle frames from 0 to 1000)
										0);								// include pan flag (0 : no or 1 : yes)
			}
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	addClipMarkers : function () {
		if (app.project.rootItem.children.numItems > 0){
			var projectItem	= app.project.rootItem.children[0]; // assumes first item is footage.
			if (projectItem) {
				if (projectItem.type == ProjectItemType.CLIP ||	projectItem.type == ProjectItemType.FILE) {
					
					markers	= projectItem.getMarkers();

					if (markers) {
						var num_markers		= markers.numMarkers;
						var new_marker		= markers.createMarker(12.345);
						var guid 			= new_marker.guid; // new in 11.1
						
						new_marker.name		= 'Marker created by PProPanel.';
						new_marker.comments	= 'Here are some comments, inserted by PProPanel.';
						new_marker.end		= 15.6789;

						//default marker type == comment. To change marker type, call one of these:

						// new_marker.setTypeAsChapter();
						// new_marker.setTypeAsWebLink();
						// new_marker.setTypeAsSegmentation();
						// new_marker.setTypeAsComment();
					}
				} else {
					$._PPP_.updateEventPanel("Can only add markers to footage items.");
				}
			} else {
				$._PPP_.updateEventPanel("Could not find first projectItem.");
			}
		} else {
			$._PPP_.updateEventPanel("Project is empty.");
		}
	},

	modifyProjectMetadata : function () {
		var kPProPrivateProjectMetadataURI	= "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";

		var namefield	= "Column.Intrinsic.Name";
		var tapename	= "Column.Intrinsic.TapeName";
		var desc		= "Column.PropertyText.Description";
		var logNote    	= "Column.Intrinsic.LogNote";
		var newField	= "ExampleFieldName";

		if (app.isDocumentOpen()) {
			var projectItem	= app.project.rootItem.children[0]; // just grabs first projectItem.
			if (projectItem) {
				if (ExternalObject.AdobeXMPScript === undefined) {
					ExternalObject.AdobeXMPScript	= new ExternalObject('lib:AdobeXMPScript');
				}
				if (ExternalObject.AdobeXMPScript !== undefined) {	// safety-conscious!
					var projectMetadata		= projectItem.getProjectMetadata();
					var successfullyAdded	= app.project.addPropertyToProjectMetadataSchema(newField, "ExampleFieldLabel",	2);

					var xmp	= new XMPMeta(projectMetadata);
					var obj	= xmp.dumpObject();

					// var aliases = xmp.dumpAliases();

					var namespaces					= XMPMeta.dumpNamespaces();
					var found_name					= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, namefield);
					var found_tapename				= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, tapename);
					var found_desc					= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, desc);
					var found_custom				= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, newField);
					var foundLogNote       			= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, logNote);
					var oldLogValue        			= "";
					var appendThis          		= "This log note inserted by PProPanel.";
					var appendTextWasActuallyNew	= false;
					 
					 if(foundLogNote){
						var oldLogNote = xmp.getProperty(kPProPrivateProjectMetadataURI, logNote);
						if (oldLogNote){
							oldLogValue = oldLogNote.value;
						}
					 }

					xmp.setProperty(kPProPrivateProjectMetadataURI, tapename, 	"***TAPENAME***");
					xmp.setProperty(kPProPrivateProjectMetadataURI, desc, 		"***DESCRIPTION***");
					xmp.setProperty(kPProPrivateProjectMetadataURI, namefield, 	"***NEWNAME***");
					xmp.setProperty(kPProPrivateProjectMetadataURI, newField, 	"PProPanel set this, using addPropertyToProjectMetadataSchema().");


					var array	= [];
					array[0]	= tapename;
					array[1]	= desc;
					array[2]	= namefield;
					array[3]	= newField;

					var concatenatedLogNotes = "";

					if (oldLogValue != appendThis){ 		// if that value is not exactly what we were going to add
						if (oldLogValue.length > 0){		// if we have a valid value
							concatenatedLogNotes += "Previous log notes: " + oldLogValue + "    ||||    ";
						}
						concatenatedLogNotes += appendThis;
						xmp.setProperty(kPProPrivateProjectMetadataURI, logNote, concatenatedLogNotes);
						array[4]    = logNote;
					}

					var str = xmp.serialize();
					projectItem.setProjectMetadata(str, array);

					// test: is it in there?

					var newblob		= projectItem.getProjectMetadata();
					var newXMP		= new XMPMeta(newblob);
					var foundYet	= newXMP.doesPropertyExist(kPProPrivateProjectMetadataURI, newField);

					if (foundYet){
						$._PPP_.updateEventPanel("PProPanel successfully added a field to the project metadata schema, and set a value for it.");
					}
				}
			} else {
				$._PPP_.updateEventPanel("No project items found.");
			}
		}
	},

	updatePAR : function() {
		var item = app.project.rootItem.children[0]; 
		if (item) {
			if ((item.type == ProjectItemType.FILE) || (item.type == ProjectItemType.CLIP)){
				// If there is an item, and it's either a clip or file...
				item.setOverridePixelAspectRatio(185,  100); // anamorphic is BACK!	  ;)
			} else {
				$._PPP_.updateEventPanel('You cannot override the PAR of bins or sequences.');
			}
		} else {
			$._PPP_.updateEventPanel("No project items found.");
		}
	},
	
	getnumAEProjectItems : function() {
		var bt		= new BridgeTalk();
		bt.target	= 'aftereffects';
		bt.body		= //'$._PPP_.updateEventPanel("Items in AE project: " + app.project.rootFolder.numItems);app.quit();';
					  'alert("Items in AE project: " + app.project.rootFolder.numItems);app.quit();';
		bt.send();
	},

	updateEventPanel : function(message) {
		app.setSDKEventMessage(message, 'info');
		//app.setSDKEventMessage('Here is some information.', 'info');
		//app.setSDKEventMessage('Here is a warning.', 'warning');
		//app.setSDKEventMessage('Here is an error.', 'error');  // Very annoying; use sparingly.
	},

	walkAllBinsForFootage : function(parentItem, outPath){
		for (var j = 0; j < parentItem.children.numItems; j++){
			var currentChild	= parentItem.children[j];
			if (currentChild){
				if (currentChild.type == ProjectItemType.BIN){
					$._PPP_.walkAllBinsForFootage(currentChild, outPath);		// warning; recursion!
				} else {
					$._PPP_.dumpProjectItemXMP(currentChild, outPath);
				}
			}
		}
	},

	searchBinForProjItemByName : function(i, containingBin, nameToFind){
		for (var j = i; j < containingBin.children.numItems; j++){
			var currentChild	= containingBin.children[j];
			if (currentChild){
				if (currentChild.type == ProjectItemType.BIN){
					return $._PPP_.searchBinForProjItemByName(j, currentChild, nameToFind);		// warning; recursion!
				} else {
					 if (currentChild.name == nameToFind){
						return currentChild;
					 } else {
						currentChild = currentItem.children[j+1];
						if (currentChild){
							return $._PPP_.searchBinForProjItemByName(0, currentChild, nameToFind);
						}
					}
				}
			}
		}
	},

	dumpProjectItemXMP : function (projectItem, outPath) {
		var xmpBlob				= projectItem.getXMPMetadata();
		var outFileName			= projectItem.name + '.xmp';
		var completeOutputPath	= outPath + $._PPP_.getSep() + outFileName;
		var outFile				= new File(completeOutputPath);

		var isThisASequence		= projectItem.isSequence();
		
		if (outFile){
			outFile.encoding = "UTF8";
			outFile.open("w", "TEXT", "????");
			outFile.write(xmpBlob.toString());
			outFile.close();
		}
	},

	addSubClip : function() {
		var startTime			= new Time;
		startTime.seconds		= 0.0;
		var endTime				= new Time;
		endTime.seconds			= 3.21;
		var hasHardBoundaries	= 0;
		var sessionCounter		= 1;
		var takeVideo			= 1; // optional, defaults to 1
		var takeAudio			= 1; //	optional, defaults to 1
		var projectItem			= app.project.rootItem.children[0]; // just grabs the first item
		if (projectItem) {
			if ((projectItem.type == ProjectItemType.CLIP)	|| (projectItem.type == ProjectItemType.FILE)) {
				var newSubClipName	= prompt('Name of subclip?',	projectItem.name + '_' + sessionCounter, 'Name your subclip');
				
				var newSubClip 	= projectItem.createSubClip(newSubClipName, 
															startTime, 
															endTime, 
															hasHardBoundaries,
															takeVideo,
															takeAudio);

				if (newSubClip){
					newSubClip.setStartTime(12.345);
				}
			} else {
				$._PPP_.updateEventPanel("Could not sub-clip " + projectItem.name + ".");
			}
		} else {
			$._PPP_.updateEventPanel("No project item found.");
		}
	},

	dumpXMPFromAllProjectItems : function() {
		var	numItemsInRoot	= app.project.rootItem.children.numItems;
		if (numItemsInRoot > 0) {
			var outPath = Folder.selectDialog("Choose the output directory");
			if (outPath) {
				for (var i = 0; i < numItemsInRoot; i++){
					var currentItem	= app.project.rootItem.children[i];
					if (currentItem){
						if (currentItem.type == ProjectItemType.BIN){
							$._PPP_.walkAllBinsForFootage(currentItem, outPath.fsName);
						} else {
							$._PPP_.dumpProjectItemXMP(currentItem, outPath.fsName);
						}
					}
				}
			}
		} else {
			$._PPP_.updateEventPanel("No project items found.");
		}
	},

	setScratchDisk : function (){
		var scratchPath = Folder.selectDialog("Choose new scratch disk directory");
		if ((scratchPath) && scratchPath.exists) {
			app.setScratchDiskPath(scratchPath.fsName, ScratchDiskType.FirstAutoSaveFolder); // see ScratchDiskType object, in ESTK.
		}
	},

	getProjectProxySetting : function() {
		var returnVal = "";
		if (app.project){
			var returnVal	= "No sequence detected in " + app.project.name + ".";
			if (app.getEnableProxies()) {
				returnVal	= 'true';
			} else {
				returnVal	= 'false';
			}
		} else {
			returnVal = "No project available.";
		}
		return returnVal;
	},

	toggleProxyState : function() {
		var update	= "Proxies for " + app.project.name + " turned ";
		if (app.getEnableProxies()) {
			app.setEnableProxies(0);
			update	= update + "OFF.";
			app.setSDKEventMessage(update, 'info');
		} else {
			app.setEnableProxies(1);
			update	= update + "ON.";
			app.setSDKEventMessage(update, 'info');
		}
	},

	setProxiesON : function () {
		var firstProjectItem = app.project.rootItem.children[0]; 
		if (firstProjectItem) {
			if (firstProjectItem.canProxy()){
				var shouldAttachProxy	= true;
				if (firstProjectItem.hasProxy()) {
					shouldAttachProxy	= confirm(firstProjectItem.name + " already has an assigned proxy. Re-assign anyway?", false, "Are you sure...?");
				}
				if (shouldAttachProxy) {
					var filterString = "";
					if (Folder.fs === 'Windows'){
						filterString = "All files:*.*";
					}
					var proxyPath	= File.openDialog(	"Choose proxy for " + firstProjectItem.name + ":", 
														filterString, 
														false);
					if (proxyPath.exists){
						firstProjectItem.attachProxy(proxyPath.fsName, 0);
					} else {
						$._PPP_.updateEventPanel("Could not attach proxy from " + proxyPath + ".");
					}
				}
			} else {
				$._PPP_.updateEventPanel("Cannot attach a proxy to " + firstProjectItem.name + ".");
			}
		} else {
			$._PPP_.updateEventPanel("No project item available.");
		}
	},

	clearCache : function () {
		app.enableQE();
		MediaType 	= {};

		// Magical constants from Premiere Pro's internal automation.

		MediaType.VIDEO = "228CDA18-3625-4d2d-951E-348879E4ED93";
		MediaType.AUDIO = "80B8E3D5-6DCA-4195-AEFB-CB5F407AB009";
		MediaType.ANY	= "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF";
		qe.project.deletePreviewFiles(MediaType.ANY);
		$._PPP_.updateEventPanel("All video and audio preview files deleted.");
	},
	
	randomizeSequenceSelection : function (){
		var sequence			= app.project.activeSequence;

		if (sequence){
			var trackGroups			= [ sequence.audioTracks, sequence.videoTracks ];
			var trackGroupNames		= [ "audioTracks", "videoTracks" ];
			var updateUI			= true;
			var before;

			for(var gi = 0; gi<2; gi++)	{
				$._PPP_.updateEventPanel(trackGroupNames[gi]);
				group	= trackGroups[gi];
				for(var ti=0; ti<group.numTracks; ti++){
					var track		= group[ti];
					var clips		= track.clips;
					var transitions	= track.transitions;
					var beforeSelected;
					var afterSelected;

					$._PPP_.updateEventPanel("track : " + ti + "	 clip count: " + clips.numTracks + "	  transition count: " + transitions.numTracks);	 

					for(var ci=0; ci<clips.numTracks; ci++){
						var clip	= clips[ci];
						name		= (clip.projectItem === undefined ? "<null>" : clip.projectItem.name);
						before		= clip.isSelected();

						// randomly select clips
						clip.setSelected((Math.random() > 0.5), updateUI);

                         if (clip.isAdjustmentLayer()){ // new in 13.0
                             $._PPP_.updateEventPanel("Clip named \"" + clip.name + "\" is an adjustment layer.");
                         }

						// Note; there's no good place to exercise this code yet, but
						// I wanted to provide example usage. 

						var allClipsInThisSequenceFromSameSource = clip.getLinkedItems();
						
                        if (allClipsInThisSequenceFromSameSource){
						$._PPP_.updateEventPanel("Found " + allClipsInThisSequenceFromSameSource.numItems + " clips from " + clip.projectItem.name + ", in this sequence.");	 
                        }
						beforeSelected	= before ? "Y" : "N";			  
						afterSelected	= clip.selected ? "Y" : "N";
						$._PPP_.updateEventPanel("clip : " + ci + "	 " + name + "		" + beforeSelected + " -> " + afterSelected);		 
					}

					for(var tni=0; tni<transitions.numTracks; ++tni){
						var transition	= transitions[tni];
						before			= transition.isSelected();
			
						// randomly select transitions
						transition.setSelected((Math.random() > 0.5), updateUI);

						beforeSelected	= before ? "Y" : "N";			  
						afterSelected	= transition.selected ? "Y" : "N";

						$._PPP_.updateEventPanel('transition: ' + tni + "		" + beforeSelected + " -> " + afterSelected);
					}
				}
			}			
		} else {
			$._PPP_.updateEventPanel("no active sequence.");
		}
	},

	// Define a couple of callback functions, for AME to use during render.
	
	onEncoderJobComplete : function (jobID, outputFilePath) {
		var eoName;

		if (Folder.fs == 'Macintosh') {
			eoName = "PlugPlugExternalObject";							
		} else {
			eoName = "PlugPlugExternalObject.dll";
		}
				
		var suffixAddedByPPro	= '_1'; // You should really test for any suffix.
		var withoutExtension	= outputFilePath.slice(0,-4); // trusting 3 char extension
		var lastIndex			= outputFilePath.lastIndexOf(".");
		var extension			= outputFilePath.substr(lastIndex + 1);

		if (outputFilePath.indexOf(suffixAddedByPPro)){
			$._PPP_.updateEventPanel(" Output filename was changed: the output preset name may have been added, or there may have been an existing file with that name. This would be a good place to deal with such occurrences.");
		}
				
		var mylib		= new ExternalObject('lib:' + eoName);
		var eventObj	= new CSXSEvent();

		eventObj.type	= "com.adobe.csxs.events.PProPanelRenderEvent";
		eventObj.data	= "Rendered Job " + jobID + ", to " + outputFilePath + ".";

		eventObj.dispatch();
	},

	onEncoderJobError : function (jobID, errorMessage) {
		var eoName; 

		if (Folder.fs === 'Macintosh') {
			eoName	= "PlugPlugExternalObject";							
		} else {
			eoName	= "PlugPlugExternalObject.dll";
		}
				
		var mylib		= new ExternalObject('lib:' + eoName);
		var eventObj	= new CSXSEvent();

		eventObj.type	= "com.adobe.csxs.events.PProPanelRenderEvent";
		eventObj.data	= "Job " + jobID + " failed, due to " + errorMessage + ".";
		eventObj.dispatch();
	},
	
	onEncoderJobProgress : function (jobID, progress) {
		$._PPP_.updateEventPanel('onEncoderJobProgress called. jobID = ' + jobID + '. progress = ' + progress + '.');
	},

	onEncoderJobQueued : function (jobID) {
		app.encoder.startBatch();
	},

	onEncoderJobCanceled : function (jobID) {
		$._PPP_.updateEventPanel('OnEncoderJobCanceled called. jobID = ' + jobID +  '.');
	},

	onPlayWithKeyframes  : function () {
		var seq = app.project.activeSequence;
		if (seq) {
			var firstVideoTrack	= seq.videoTracks[0];
			if (firstVideoTrack){
				var firstClip	= firstVideoTrack.clips[0];
				if (firstClip){
					var clipComponents	= firstClip.components;
					if (clipComponents){
						for (var i = 0; i < clipComponents.numItems; ++i){
							$._PPP_.updateEventPanel('component ' + i + ' = ' + clipComponents[i].matchName + ' : ' + clipComponents[i].displayName);
						}
						if (clipComponents.numItems > 2){
							
							// 0 = clip
							// 1 = Opacity
							// N effects, then...
							// Shape layer (new in 12.0)
							
							var blur	= clipComponents[2]; // Assume Gaussian Blur is the first effect applied to the clip.
							if (blur){
								var blurProps	= blur.properties;
								if (blurProps){
									for( var j = 0; j < blurProps.numItems; ++j){
										$._PPP_.updateEventPanel('param ' + j + ' = ' + blurProps[j].displayName);
									}
									var blurriness	= blurProps[0];
									if (blurriness){
										if (!blurriness.isTimeVarying()){
											blurriness.setTimeVarying(true);
										}
										for(var k = 0; k < 20; ++k){
											updateUI	= (k==9);  		// Decide how often to update PPro's UI
											blurriness.addKey(k);
											var blurVal	= Math.sin(3.14159*i/5)*20+25;
											blurriness.setValueAtKey(k, blurVal, updateUI);
										}
									}
									var repeatEdgePixels	= blurProps[2];
									if (repeatEdgePixels){
										if (!repeatEdgePixels.getValue()){
											updateUI	= true;
											repeatEdgePixels.setValue(true, updateUI);
										}
									}
									// look for keyframe nearest to 4s with 1/10 second tolerance
									var keyFrameTime	= blurriness.findNearestKey(4.0, 0.1);
									if (keyFrameTime !== undefined){
										$._PPP_.updateEventPanel('Found keyframe = ' + keyFrameTime.seconds);
									} else {
										$._PPP_.updateEventPanel('Keyframe not found.');
									}

									// scan keyframes, forward

									keyFrameTime	= blurriness.findNearestKey(0.0, 0.1);
									var lastKeyFrameTime	= keyFrameTime;
									while(keyFrameTime !== undefined){
										$._PPP_.updateEventPanel('keyframe @ ' + keyFrameTime.seconds);
										lastKeyFrameTime	= keyFrameTime;
										keyFrameTime		= blurriness.findNextKey(keyFrameTime);
									}

									// scan keyframes, backward
									keyFrameTime	= lastKeyFrameTime;
									while(keyFrameTime	!== undefined){
										$._PPP_.updateEventPanel('keyframe @ ' + keyFrameTime.seconds);
										lastKeyFrameTime	= keyFrameTime;
										keyFrameTime		= blurriness.findPreviousKey(keyFrameTime);
									}

									// get all keyframes

									var blurKeyframesArray	= blurriness.getKeys();
									if (blurKeyframesArray){
										$._PPP_.updateEventPanel(blurKeyframesArray.length + ' keyframes found');
									}

									// remove keyframe at 19s
									blurriness.removeKey(19);

									// remove keyframes in range from 0s to 5s
									var shouldUpdateUI	= true;
									blurriness.removeKeyRange(0,5, shouldUpdateUI);
								}

						} else {
								$._PPP_.updateEventPanel("Please apply the Gaussian Blur effect to the first clip in the first video track of the active sequence.");
					}
						}
					}
				}
			}
		} else {
			$._PPP_.updateEventPanel("no active sequence.");
		}
	},

	extractFileNameFromPath : function (fullPath){
		var lastDot	= fullPath.lastIndexOf(".");
		var lastSep	= fullPath.lastIndexOf("/");

		if (lastDot > -1){
			return fullPath.substr( (lastSep +1), (fullPath.length - (lastDot + 1)));
		} else {
			return fullPath;
		}
	},

	onProxyTranscodeJobComplete : function (jobID, outputFilePath) {
		var suffixAddedByPPro	= '_1'; // You should really test for any suffix.
		var withoutExtension	= outputFilePath.slice(0,-4); // trusting 3 char extension
		var lastIndex			= outputFilePath.lastIndexOf(".");
		var extension			= outputFilePath.substr(lastIndex + 1);

		var wrapper		= [];
		wrapper[0]		= outputFilePath;
		
		var nameToFind	= 'Proxies generated by PProPanel';
		var targetBin	= $._PPP_.getPPPInsertionBin();
		if (targetBin){
			app.project.importFiles(wrapper);
		}
	},

	onProxyTranscodeJobError : function  (jobID, errorMessage) {
			$._PPP_.updateEventPanel(errorMessage);
	},

	onProxyTranscodeJobQueued : function (jobID) {
		 app.encoder.startBatch();
	},

	ingestFiles : function(outputPresetPath) {
		app.encoder.bind('onEncoderJobComplete',	$._PPP_.onProxyTranscodeJobComplete);
		app.encoder.bind('onEncoderJobError',		$._PPP_.onProxyTranscodeJobError);
		app.encoder.bind('onEncoderJobQueued',		$._PPP_.onProxyTranscodeJobQueued);
		app.encoder.bind('onEncoderJobCanceled',	$._PPP_.onEncoderJobCanceled);

		if (app.project) {
			var filterString = "";
			if (Folder.fs === 'Windows'){
				filterString = "All files:*.*";
			}
			var fileOrFilesToImport	= File.openDialog(	"Choose full resolution files to import", 	// title
														filterString, 								// filter available files? 
														true); 										// allow multiple?
			if (fileOrFilesToImport) {
				var nameToFind	= 'Proxies generated by PProPanel';
				var targetBin	= $._PPP_.searchForBinWithName(nameToFind);
				if (targetBin === 0) {
					// If panel can't find the target bin, it creates it.
					app.project.rootItem.createBin(nameToFind);
					targetBin = $._PPP_.searchForBinWithName(nameToFind);
				}	
				if (targetBin){
					targetBin.select();
					var importThese = []; // We have an array of File objects; importFiles() takes an array of paths.
					if (importThese){
						for (var i = 0; i < fileOrFilesToImport.length; i++) {
							importThese[i]			= fileOrFilesToImport[i].fsName;
							var justFileName		= extractFileNameFromPath(importThese[i]);
							var suffix				= '_PROXY.mp4'; 
							var containingPath		= fileOrFilesToImport[i].parent.fsName;
							var completeProxyPath	= containingPath + $._PPP_.getSep() + justFileName + suffix; 

							var jobID				=	app.encoder.encodeFile(fileOrFilesToImport[i].fsName, 
														completeProxyPath, 
														outputPresetPath, 
														0);
						}

						app.project.importFiles(importThese, 
												1,				// suppress warnings 
												targetBin,
												0);				// import as numbered stills
					}
				} else {
					$._PPP_.updateEventPanel("Could not find or create target bin.");
				}
			} else {
				$._PPP_.updateEventPanel("No files to import.");
			}
		} else {
			$._PPP_.updateEventPanel("No project found.");
		}
	},

	insertOrAppend : function() {
		var seq = app.project.activeSequence;
		if (seq){
			var first = app.project.rootItem.children[0];
			if (first){
				 var numVTracks = seq.videoTracks.numTracks;
				 var targetVTrack = seq.videoTracks[(numVTracks - 1)];
				if (targetVTrack){
					// If there are already clips in this track,
					// append this one to the end. Otherwise, 
					// insert at start time.

					if (targetVTrack.clips.numItems > 0){
						var lastClip = targetVTrack.clips[(targetVTrack.clips.numItems - 1)];
						if (lastClip){
							targetVTrack.insertClip(first, lastClip.end.seconds);
						}
					}else {
							targetVTrack.insertClip(first, '00;00;00;00');
					}
				} else {
					$._PPP_.updateEventPanel("Could not find first video track.");
				}
			} else {
				$._PPP_.updateEventPanel("Couldn't locate first projectItem.");
			}
		} else {
			$._PPP_.updateEventPanel("no active sequence.");
		}
	},

	overWrite : function() {
		var seq = app.project.activeSequence;
		if (seq){
			var first = app.project.rootItem.children[0];
			if (first) {
				var vTrack1 = seq.videoTracks[0];
				if (vTrack1){
					var now = seq.getPlayerPosition();
					vTrack1.overwriteClip(first, now.seconds);
				} else {
					$._PPP_.updateEventPanel("Could not find first video track.");
				}
			} else {
				$._PPP_.updateEventPanel("Couldn't locate first projectItem.");
			}
		} else {
			$._PPP_.updateEventPanel("no active sequence.");
		}
	},

	closeFrontSourceClip : function() {
		app.sourceMonitor.closeClip();
	},
	
	closeAllClipsInSourceMonitor : function() {
		app.sourceMonitor.closeAllClips();
	},

	changeLabel : function () {
		var first = app.project.rootItem.children[0];
		if (first){
			var currentLabel = first.getColorLabel();
			var newLabel 	 = currentLabel + 1;  // 4 = Cerulean. 0 = Violet, 15 = Yellow.
			if (newLabel > 15){
				newLabel = newLabel - 16;
			}
			app.setSDKEventMessage("Previous Label color = " + currentLabel + ".", 'info');
			first.setColorLabel(newLabel);
			app.setSDKEventMessage("New Label color = " + newLabel + ".", 'info');
		} else {
			$._PPP_.updateEventPanel("Couldn't locate first projectItem.");
		}
	},

	getPPPInsertionBin : function () {
		var nameToFind = "Here's where PProPanel puts things.";

		var targetBin	= $._PPP_.searchForBinWithName(nameToFind);

		if (targetBin === undefined) {
			// If panel can't find the target bin, it creates it.
			app.project.rootItem.createBin(nameToFind);
			targetBin	= $._PPP_.searchForBinWithName(nameToFind);
		}
		if (targetBin) {
			targetBin.select();
			return targetBin;
		}
	},

	importComps : function () {
		var targetBin = $._PPP_.getPPPInsertionBin();
		if (targetBin){
			var filterString = "";
			if (Folder.fs === 'Windows'){
				filterString = "All files:*.*";
			}
            compNamesToImport = [];
            
			var aepToImport	= 	File.openDialog (	"Choose After Effects project", 	// title
													filterString,						// filter available files? 
													false);								// allow multiple?
			if (aepToImport) {
				var importAll 	=	confirm("Import all compositions in project?", false, "Import all?");
				if (importAll){
					var result 	= 	app.project.importAllAEComps(aepToImport.fsName, targetBin);
				} else {
					var compName = 	prompt(	'Name of composition to import?',	 
											'', 
											'Which Comp to import');
					if (compName){
                        compNamesToImport[0] = compName;
                        var importAECompResult = app.project.importAEComps(aepToImport.fsName, compNamesToImport, targetBin);
					} else {
						$._PPP_.updateEventPanel("Could not find Composition.");
					}
				}
			} else {
				$._PPP_.updateEventPanel("Could not open project.");
			}
		} else {
			$._PPP_.updateEventPanel("Could not find or create target bin.");
		}
	},
	
	consolidateProject : function () {
		var pmo = app.projectManager.options;

		if (app.project.sequences.length){
		if (pmo) {
			var filterString = "";
			if (Folder.fs === 'Windows'){
				filterString = "Output Presets:*.epr";
			}
	
			var outFolder			= Folder.selectDialog("Choose output directory.");
			if (outFolder) {

				var presetPath 			= "";
				var useSpecificPreset	= confirm("Would you like to select an output preset?", false, "Are you sure...?");
				if (useSpecificPreset){
					var useThisEPR	= File.openDialog (	"Choose output preset (.epr file)", 	// title
														filterString, 							// filter available files? 
														false); 								// allow multiple?

					if (useThisEPR){
						pmo.clipTranscoderOption = pmo.CLIP_TRANSCODE_MATCH_PRESET;	
						pmo.encoderPresetFilePath 		=	useThisEPR.fsName;
					}
				} else {
					pmo.clipTranscoderOption = pmo.CLIP_TRANSCODE_MATCH_SEQUENCE;	
				}
			
				var processAllSequences	= confirm("Process all sequences? No = just the first sequence found.", true, "Process all?");
				
				if (processAllSequences){
					pmo.includeAllSequences = true;
				} else {
					pmo.includeAllSequences = false;
					pmo.affectedSequences 	= [app.project.sequences[0]];
				}
			
				pmo.clipTransferOption 			= 	pmo.CLIP_TRANSFER_TRANSCODE;
				pmo.convertAECompsToClips		=	false;
				pmo.convertSyntheticsToClips 	=	false;
				pmo.copyToPreventAlphaLoss 		=	false;
				pmo.destinationPath 			=	outFolder.fsName;
				pmo.excludeUnused 				=	false;
				pmo.handleFrameCount 			=	0;
				pmo.includeConformedAudio		=	true;
				pmo.includePreviews 			=	true;
				pmo.renameMedia					=	false;

				var result		= app.projectManager.process(app.project);
				var errorList 	= app.projectManager.errors;
				
				if(errorList.length){
					for (var k = 0; k < errorList.length; k++){
						$._PPP_.updateEventPanel(errorList[k][1]);
					}
				} else {
					$._PPP_.updateEventPanel(app.project.name + " successfully processed to " + outFolder.fsName + ".");
				}
				return result;
			}
		}


		}
		if (pmo) {
			var filterString = "";
			if (Folder.fs === 'Windows'){
				filterString = "Output Presets:*.epr";
			}
	
			var outFolder			= Folder.selectDialog("Choose output directory.");
			if (outFolder) {

				var presetPath 			= "";
				var useSpecificPreset	= confirm("Would you like to select an output preset?", false, "Are you sure...?");
				if (useSpecificPreset){
					var useThisEPR	= File.openDialog (	"Choose output preset (.epr file)", 	// title
														filterString, 							// filter available files? 
														false); 								// allow multiple?

					if (useThisEPR){
						pmo.clipTranscoderOption = pmo.CLIP_TRANSCODE_MATCH_PRESET;	
						pmo.encoderPresetFilePath 		=	useThisEPR.fsName;
					}
				} else {
					pmo.clipTranscoderOption = pmo.CLIP_TRANSCODE_MATCH_SEQUENCE;	
				}
			
				var processAllSequences	= confirm("Process all sequences? No = just the first sequence found.", true, "Process all?");
				
				if (processAllSequences){
					pmo.includeAllSequences = true;
				} else {
					pmo.includeAllSequences = false;
					pmo.affectedSequences 	= [app.project.sequences[0]];
				}
			
				pmo.clipTransferOption 			= 	pmo.CLIP_TRANSFER_TRANSCODE;
				pmo.convertAECompsToClips		=	false;
				pmo.convertSyntheticsToClips 	=	false;
				pmo.copyToPreventAlphaLoss 		=	false;
				pmo.destinationPath 			=	outFolder.fsName;
				pmo.excludeUnused 				=	false;
				pmo.handleFrameCount 			=	0;
				pmo.includeConformedAudio		=	true;
				pmo.includePreviews 			=	true;
				pmo.renameMedia					=	false;

				var result		= app.projectManager.process(app.project);
				var errorList 	= app.projectManager.errors;
				
				if(errorList.length){
					for (var k = 0; k < errorList.length; k++){
						$._PPP_.updateEventPanel(errorList[k][1]);
					}
				} else {
					$._PPP_.updateEventPanel(app.project.name + " successfully processed to " + outFolder.fsName + ".");
				}
				return result;
			}
		}
	},

	importMoGRT : function () {
		var activeSeq = app.project.activeSequence;
		if (activeSeq) {
			var filterString = "";
			if (Folder.fs === 'Windows'){
				filterString = "Motion Graphics Templates:*.mogrt";
			}
			var mogrtToImport	= 	File.openDialog (  "Choose MoGRT", 	// title
														filterString,	// filter available files? 
														false);			// allow multiple?
			if (mogrtToImport){
				var targetTime		= activeSeq.getPlayerPosition();
				var vidTrackOffset  = 0;
				var audTrackOffset	= 0;
				var newTrackItem 	= activeSeq.importMGT(	mogrtToImport.fsName, 
															targetTime.ticks, 
															vidTrackOffset,
															audTrackOffset);
				if (newTrackItem){
					var moComp = newTrackItem.getMGTComponent();
					if (moComp){
						var params			= 	moComp.properties;
						for (var z = 0; z < params.numItems; z++){
						   var thisParam = params[0];
						}
						var srcTextParam	=	params.getParamForDisplayName("Main Title");
						if (srcTextParam){
							var val	= srcTextParam.getValue();
							srcTextParam.setValue("New value set by PProPanel!");
						}
					}
				}
			} else {
				app.setSDKEventMessage('Unable to import ' + mogrtToImport.fsName + '.', 'error');  
			}
		} else {
			app.setSDKEventMessage('No active sequence.');  
		}
	},

	reportCurrentProjectSelection : function() {
		var viewIDs = app.getProjectViewIDs(); // sample code optimized for a single open project
		viewSelection = app.getProjectViewSelection(viewIDs[0]);
		$._PPP_.projectPanelSelectionChanged(viewSelection, viewIDs[0]);
	},

	randomizeProjectSelection : function() {
		var viewIDs 					= app.getProjectViewIDs();
		var firstProject 				= app.getProjectFromViewID(viewIDs[0]);
		var arrayOfRandomProjectItems 	= [];
		
		for (var b = 0; b < app.project.rootItem.children.numItems; b++){
			var currentProjectItem = app.project.rootItem.children[b];
			if (Math.random() > 0.5){
				arrayOfRandomProjectItems.push(currentProjectItem);
			}
		}
		if (arrayOfRandomProjectItems.length > 0){
			app.setProjectViewSelection(arrayOfRandomProjectItems, viewIDs[0]);
		}
	},

	setAllProjectItemsOnline : function(startingBin){
		for (var k = 0; k < startingBin.children.numItems; k++){
			var currentChild = startingBin.children[k];
			if (currentChild){
				if (currentChild.type === ProjectItemType.BIN){
					$._PPP_.setAllProjectItemsOnline(currentChild);		// warning; recursion!
				} else if (currentChild.isOffline()){
					currentChild.changeMediaPath(currentChild.getMediaPath(), true);
                    if (currentChild.isOffline()){
                         $._PPP_.updateEventPanel("Failed to bring \'" + currentChild.name + "\' online.");
                    } else {
                         $._PPP_.updateEventPanel("\'" + currentChild.name + "\' is once again online.");
                    }
				}
			}
		}
	},

	setAllOnline : function(){
		var startingBin = app.project.rootItem;
		$._PPP_.setAllProjectItemsOnline(startingBin);
	},

	setOffline : function() {
		var viewIDs = app.getProjectViewIDs();
        for (var a = 0; a < app.projects.numProjects; a++){
            var currentProject = app.getProjectFromViewID(viewIDs[a]);
            if (currentProject){
                if (currentProject.documentID === app.project.documentID){	// We're in the right project!
                    var selectedItems = app.getProjectViewSelection(viewIDs[a]);
                    for (var b = 0; b < selectedItems.length; b++){
                        var currentItem = selectedItems[b];
                        if (currentItem){
                            if ((!currentItem.isSequence()) && (currentItem.type !== ProjectItemType.BIN)){ // For every selected item which isn't a bin or sequence...
                                if (currentItem.isOffline()){
									$._PPP_.updateEventPanel("\'" + currentItem.name + "\'was already offline.");
								} else {
									var result = currentItem.setOffline();
									$._PPP_.updateEventPanel("\'" + currentItem.name + "\' is now offline.");
								}
                            }
                        }
                    }
                }
            }
        }
	},
	
	updateFrameRate : function() {
		var item = app.project.rootItem.children[0]; 
		if (item) {
			if ((item.type == ProjectItemType.FILE) || (item.type == ProjectItemType.CLIP)){
				// If there is an item, and it's either a clip or file...
				item.setOverrideFrameRate(23.976); 
			} else {
				$._PPP_.updateEventPanel('You cannot override the frame rate of bins or sequences.');
			}
		} else {
			$._PPP_.updateEventPanel("No project items found.");
		}
	},

	onItemAddedToProject : function(whichProject, addedProjectItem) {
		var msg = addedProjectItem.name + " was added to " + whichProject + "."
		$._PPP_.updateEventPanel(msg);
	},

	registerItemAddedFxn : function() {
		app.onItemAddedToProjectSuccess = $._PPP_.onItemAddedToProject;
	},

	myOnProjectChanged : function(documentID){
		var msg = 'Project with ID ' + documentID + ' Changed.';
		// Commented out, as this happens a LOT.
		// $._PPP_.updateEventPanel(msg);
	},

	registerProjectChangedFxn : function() {
//~ 		app.bind('onProjectChanged', $._PPP_.myOnProjectChanged);
	},

	confirmPProHostVersion : function() {
		var version = parseFloat(app.version);
		if (version < 12.1){
			$._PPP_.updateEventPanel("Note: PProPanel relies on features added in 12.1, but is currently running in " + version + ".");
		}
	},

	changeMarkerColors : function() {
		if (app.project.rootItem.children.numItems > 0){
			var projectItem	= app.project.rootItem.children[0]; // assumes first item is footage.
			if (projectItem) {
				if (projectItem.type == ProjectItemType.CLIP ||
					projectItem.type == ProjectItemType.FILE) {
					
					markers	= projectItem.getMarkers();

					if (markers) {
						var markerCount		= markers.numMarkers;
						
						if (markerCount){
							for(var thisMarker	=	markers.getFirstMarker(); thisMarker	!==	undefined; 	thisMarker	=	markers.getNextMarker(thisMarker)){
								var oldColor = thisMarker.getColorByIndex();
								var newColor = oldColor + 1;
								if (newColor > 7){
									newColor = 0;
								}
								thisMarker.setColorByIndex(newColor);
								$._PPP_.updateEventPanel("Changed color of marker named \'" + thisMarker.name + "\' from " + oldColor + " to " + newColor + ".");
							}
						}
					}
				} else {
					$._PPP_.updateEventPanel("Can only add markers to footage items.");
				}
			} else {
				$._PPP_.updateEventPanel("Could not find first projectItem.");
			}
		} else {
			$._PPP_.updateEventPanel("Project is empty.");
		}	
	},

	changeSeqTimeCodeDisplay : function() {
		if (app.project.activeSequence){
			var currentSeqSettings = app.project.activeSequence.getSettings();
			if (currentSeqSettings){
				var oldVidSetting = currentSeqSettings.videoDisplayFormat;
				currentSeqSettings.videoDisplayFormat = oldVidSetting + 1;
				if (currentSeqSettings.videoDisplayFormat > TIMEDISPLAY_48Timecode){
					currentSeqSettings.videoDisplayFormat = TIMEDISPLAY_24Timecode;
				}
				app.project.activeSequence.setSettings(currentSeqSettings);
				$._PPP_.updateEventPanel("Changed timecode display format for \'" + app.project.activeSequence.name + "\'.");
			}
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	myActiveSequenceChangedFxn : function() {
		$._PPP_.updateEventPanel("Active sequence is now " + app.project.activeSequence.name + ".");
	},

	myActiveSequenceSelectionChangedFxn : function() {
		var sel = app.project.activeSequence.getSelection();
		$._PPP_.updateEventPanel('Current active sequence = ' + app.project.activeSequence.name + '.');
		$._PPP_.updateEventPanel( sel.length + ' track items selected.');
		for(var i = 0; i < sel.length; i++){
			if (sel[i].name !== 'anonymous'){
				$._PPP_.updateEventPanel('Selected item ' + (i+1) + ' == ' + sel[i].name + '.');
			}
		}	
	},

	registerActiveSequenceChangedFxn : function() {
		var success = app.bind("onActiveSequenceChanged", $._PPP_.myActiveSequenceChangedFxn);
	},

	registerSequenceSelectionChangedFxn : function() {
//~ 		var success = app.bind('onActiveSequenceSelectionChanged', $._PPP_.myActiveSequenceSelectionChangedFxn);
	},

	enableNewWorldScripting : function(){
		app.enableQE();

		var previousNWValue = qe.getDebugDatabaseEntry("ScriptLayerPPro.EnableNewWorld");
		var previousInternalDOMValue = qe.getDebugDatabaseEntry("dvascripting.EnabledInternalDOM");
		if ((previousNWValue === 'true') && (previousInternalDOMValue === 'true')){
			qe.setDebugDatabaseEntry("ScriptLayerPPro.EnableNewWorld", "false");
			qe.setDebugDatabaseEntry("dvascripting.EnabledInternalDOM", "false");
			$._PPP_.updateEventPanel("ScriptLayerPPro.EnableNewWorld and dvascripting.EnabledInternalDOM are now OFF.");
		} else {
			qe.setDebugDatabaseEntry("ScriptLayerPPro.EnableNewWorld", "true");
			qe.setDebugDatabaseEntry("dvascripting.EnabledInternalDOM", "true");
			$._PPP_.updateEventPanel("ScriptLayerPPro.EnableNewWorld and dvascripting.EnabledInternalDOM are now ON.");
		}
	},

	insertOrAppendToTopTracks : function() {
		var seq = app.project.activeSequence;
		if (seq){
			var first = app.project.rootItem.children[0];
			if (first){
                var time = seq.getPlayerPosition();
                var newClip = seq.insertClip(first, time, (seq.videoTracks.numTracks - 1), (seq.audioTracks.numTracks - 1));
                if (newClip){
                    $._PPP_.updateEventPanel("Inserted " + newClip.name + ", into " + seq.name + ".");
                }
			} else {
				$._PPP_.updateEventPanel("Couldn't locate first projectItem.");
			}
		} else {
			$._PPP_.updateEventPanel("no active sequence.");
		}
	},

	closeAllProjectsOtherThanActiveProject : function() {
		var viewIDs = app.getProjectViewIDs(); 
		var closeTheseProjects = [];
		for (var a = 0; a < viewIDs.length; a++){
			var thisProj = app.getProjectFromViewID(viewIDs[a]);
			if (thisProj.documentID !== app.project.documentID){
				closeTheseProjects[a] = thisProj;
			}       
		}
		// Why do this afterward? Because if we close projects in that loop, we change the active project. :)
		for (var b = 0; b < closeTheseProjects.length; b++){
			$._PPP_.updateEventPanel("Closed " + closeTheseProjects[b].name);
			closeTheseProjects[b].closeDocument();
		}
	},

	countAdjustmentLayersInBin : function(parentItem, arrayOfAdjustmentLayerNames, foundSoFar){
		for (var j = 0; j < parentItem.children.numItems; j++){
			var currentChild	= parentItem.children[j];
			if (currentChild){
				if (currentChild.type == ProjectItemType.BIN){
					$._PPP_.countAdjustmentLayersInBin(currentChild, arrayOfAdjustmentLayerNames, foundSoFar);		// warning; recursion!
				} else {
					if (currentChild.isAdjustmentLayer()){
                        arrayOfAdjustmentLayerNames[foundSoFar] = currentChild.name;
                        foundSoFar++;
					}
				}
			}
		}
	},

	findAllAdjustmentLayersInProject : function() {
		var arrayOfAdjustmentLayerNames = [];
		var foundSoFar 					= 0;
		var startingBin 				= app.project.rootItem;

		$._PPP_.countAdjustmentLayersInBin(startingBin, arrayOfAdjustmentLayerNames, foundSoFar);
		if (arrayOfAdjustmentLayerNames.length){
			var remainingArgs 	= arrayOfAdjustmentLayerNames.length;
			var message 		= remainingArgs + " adjustment layers found: ";

			for (var i = 0; i < arrayOfAdjustmentLayerNames.length; i++) {
				message += arrayOfAdjustmentLayerNames[i];
				remainingArgs--;
				if (remainingArgs > 1) {
					message += ', ';
				}
				if (remainingArgs === 1){
					message += ", and ";
				} 
				if (remainingArgs === 0) {
					message += ".";
				}
			}
			$._PPP_.updateEventPanel(message);
		} else {
			$._PPP_.updateEventPanel("No adjustment layers found in " + app.project.name + ".");
		}
	},

	consolidateDuplicates : function() {
		result = app.project.consolidateDuplicates();
		$._PPP_.updateEventPanel("Duplicates consolidated in " + app.project.name + ".");
	},

	closeAllSequences : function() {
		var seqList = app.project.sequences;
		for (var a = 0; a < seqList.numSequences; a++){
			var currentSeq = seqList[a];
			if (currentSeq){
				currentSeq.close();
			} else {
				$._PPP_.updateEventPanel("No sequences from " + app.project.name + " were open.");
			}
		}
	},

	dumpAllPresets : function() {
		var desktopPath			= new File("~/Desktop");
		var outputFileName		= desktopPath.fsName + $._PPP_.getSep() + 'available_presets.txt';
		var selectedPreset 		= undefined;
		var selectedExporter 	= undefined;
		var exporters 			= app.encoder.getExporters();
	
		var outFile = new File(outputFileName);

		outFile.encoding = "UTF8";
		outFile.open("w", "TEXT", "????");

		for(var i = 0; i < exporters.length; i++){
			var exporter = exporters[i];
			if (exporter){
				outFile.writeln('-----------------------------------------------');
				outFile.writeln(i + ':' + exporter.name + ' : ' + exporter.classID + ' : ' + exporter.fileType);
				var presets = exporter.getPresets();
				if (presets){
					outFile.writeln(presets.length + ' presets found');
					for(var j = 0; j < presets.length; j++){
						var preset = presets[j];
						if (preset){
							outFile.writeln('matchName: ' + preset.matchName + '(' + preset.name+')');
							if (preset.name.indexOf('TQM') > -1){ 
								selectedPreset 		= preset;
								selectedExporter 	= exporter;
								outFile.writeln('selected preset = ' + selectedExporter.name + ' : ' + selectedPreset.name);
								selectedPreset.writeToFile(desktopPath.fsName + $._PPP_.getSep() + preset.name + ".epr");
								$._PPP_.updateEventPanel("List of available presets saved to desktop as \'available_presets.txt\'");
							}
						}
					}
				}
			}
		}
		desktopPath.close();
		outFile.close();
    },

	reportSequenceVRSettings : function() {
		var seq = app.project.activeSequence;
		if (seq){
			var settings = seq.getSettings();
			if (settings){
				$._PPP_.updateEventPanel("====================================================");
				$._PPP_.updateEventPanel("VR Settings for \'" + seq.name + "\':");
				$._PPP_.updateEventPanel("");
				$._PPP_.updateEventPanel("          Horizontal captured view: " + settings.vrHorzCapturedView);
				$._PPP_.updateEventPanel("          Vertical captured view: " + settings.vrVertCapturedView);
				$._PPP_.updateEventPanel("          Layout: " + settings.Layout);
				$._PPP_.updateEventPanel("          Projection: " + settings.vrProjection);
				$._PPP_.updateEventPanel("");
				$._PPP_.updateEventPanel("====================================================");
			}
		}
	},

	openProjectItemInSource : function() {
		var viewIDs = app.getProjectViewIDs();
		if (viewIDs){
			for (var a = 0; a < app.projects.numProjects; a++){
				var currentProject = app.getProjectFromViewID(viewIDs[a]);
				if (currentProject){
					if (currentProject.documentID === app.project.documentID){	// We're in the right project!
						var selectedItems = app.getProjectViewSelection(viewIDs[a]);
						for (var b = 0; b < selectedItems.length; b++){
							var currentItem = selectedItems[b];
							if (currentItem){
								if (currentItem.type !== ProjectItemType.BIN){ // For every selected item which isn't a bin or sequence...
									app.sourceMonitor.openProjectItem(currentItem);
								}
							} else {
								$._PPP_.updateEventPanel("No item available.");
							}
						}
					}
				} else {
					$._PPP_.updateEventPanel("No project available.");
				}
			}
		} else {
			$._PPP_.updateEventPanel("No view IDs available.");
		}
	},

	reinterpretFootage : function() {
		var viewIDs = app.getProjectViewIDs();
		if (viewIDs){
			for (var a = 0; a < app.projects.numProjects; a++){
				var currentProject = app.getProjectFromViewID(viewIDs[a]);
				if (currentProject){
					if (currentProject.documentID === app.project.documentID){	// We're in the right project!
						var selectedItems = app.getProjectViewSelection(viewIDs[a]);
						if (selectedItems){
							for (var b = 0; b < selectedItems.length; b++){
								var currentItem = selectedItems[b];
								if (currentItem){
									if ((currentItem.type !== ProjectItemType.BIN) &&
										(currentItem.isSequence() === false)){ 
										var interp = currentItem.getFootageInterpretation();
										if (interp) {
											// Note: I made this something terrible, so the change is apparent.
											interp.frameRate = 17.868;
											interp.pixelAspectRatio = 1.2121;
											currentItem.setFootageInterpretation(interp);
										} else {
											$._PPP_.updateEventPanel("Unable to get interpretation for " + currentItem.name + ".");
										}
										var mapping = currentItem.getAudioChannelMapping;
										if (mapping){
											mapping.audioChannelsType = AUDIOCHANNELTYPE_Stereo; 
											mapping.audioClipsNumber = 1;
											mapping.setMappingForChannel(0, 4); // 1st param = channel index, 2nd param = source index
											mapping.setMappingForChannel(1, 5);
											currentItem.setAudioChannelMapping(mapping); // submit changed mapping object
										}
									}
								} else {
									$._PPP_.updateEventPanel("No project item available.");
								}
							}
						} else {
							$._PPP_.updateEventPanel("No items selected.");
						}
					}
				} else {
					$._PPP_.updateEventPanel("No project available.");
				}
			}
		} else {
			$._PPP_.updateEventPanel("No view IDs available.");
		}
	}, 

	createSubSequence : function() {

		/* 	Behavioral Note

			createSubSequence() uses track targeting to select clips when there is
			no current clip selection, in the sequence. To create a subsequence with
			clips on tracks that are currently NOT targeted, either select some clips
			(on any track), or temporarily target all desired tracks.

		*/

		var activeSequence = app.project.activeSequence;
		if (activeSequence) {
			var foundTarget = false;
			for (var a = 0; (a < activeSequence.videoTracks.numTracks) && (foundTarget === false); a++){
				var vTrack = activeSequence.videoTracks[a];
				if (vTrack){
					if (vTrack.isTargeted()){
						foundTarget = true;
					}
				}
			}
			// If no targeted track was found, just target the zero-th track, for demo purposes
			if (foundTarget === false){
				activeSequence.videotracks[0].setTargeted(true, true);
			}

			var cloneAnyway = true;
			if ((activeSequence.getInPoint() == NOT_SET) && (activeSequence.getOutPoint() == NOT_SET)){
				cloneAnyway = confirm("No in or out points set; clone entire sequence?", false, "Clone the whole thing?");
			}
			if (cloneAnyway){
				var ignoreMapping = confirm("Ignore track mapping?", false, "Ignore track mapping?");
				var newSeq = activeSequence.createSubsequence(ignoreMapping);
				// rename newSeq here, as desired.
			}
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	}, 

	selectAllRetimedClips : function() {
		var activeSeq = app.project.activeSequence;
		var numRetimedClips = 0;
		if (activeSeq){
			var trackGroups			= [ activeSeq.audioTracks, activeSeq.videoTracks ];
			var trackGroupNames		= [ "audioTracks", "videoTracks" ];
			var updateUI			= true;

			for(var gi = 0; gi<2; gi++)	{
				group	= trackGroups[gi];
				for(var ti=0; ti<group.numTracks; ti++){
					var track		= group[ti];
					var clips		= track.clips;
					for(var ci=0; ci<clips.numTracks; ci++){
						var clip	= clips[ci];
						if (clip.getSpeed() !== 1){
							clip.setSelected(true, updateUI);
							numRetimedClips++;
						}
					}
				}
			}			
			$._PPP_.updateEventPanel(numRetimedClips + " retimed clips found.");
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	selectReversedClips : function() {
		var sequence		= app.project.activeSequence;
		var numReversedClips = 0;
		if (sequence){
			var trackGroups			= [ sequence.audioTracks, sequence.videoTracks ];
			var trackGroupNames		= [ "audioTracks", "videoTracks" ];
			var updateUI			= true;

			for(var gi = 0; gi<2; gi++)	{
				for(var ti=0; ti<group.numTracks; ti++){
					for(var ci=0; ci < group[ti].clips.numTracks; ci++){
						var clip = group[ti].clips[ci];
						var isReversed = clip.isSpeedReversed();
						if (isReversed){
							clip.setSelected(isReversed, updateUI);
							numReversedClips++;
						}
					}
				}
			}
			$._PPP_.updateEventPanel(numReversedClips + " reversed clips found.");
		} else {
			$._PPP_.updateEventPanel("No active sequence.");
		}
	},

	logConsoleOutput : function() {
		app.enableQE();
		var logFileName = "PPro_Console_output.txt"
		var outFolder	= Folder.selectDialog("Where do you want to save the log file?");
		if (outFolder){
			var entireOutputPath = outFolder.fsName + $._PPP_.getSep() + logFileName;
			var result = qe.executeConsoleCommand("con.openlog " + entireOutputPath);
			$._PPP_.updateEventPanel("Log opened at " + entireOutputPath + ".");
		}
	},

	closeLog : function() {
		app.enableQE();
		qe.executeConsoleCommand("con.closelog");
	},

	stitch : function(presetPath) {
		var viewIDs = app.getProjectViewIDs();
		var allPathsToStitch = "";

        for (var a = 0; a < app.projects.numProjects; a++){
            var currentProject = app.getProjectFromViewID(viewIDs[a]);
            if (currentProject){
                if (currentProject.documentID === app.project.documentID){	// We're in the right project!
                    var selectedItems = app.getProjectViewSelection(viewIDs[a]);
					if (selectedItems.length){
						for (var b = 0; b < selectedItems.length; b++){
							var currentItem = selectedItems[b];
							if (currentItem){
								if ((!currentItem.isSequence()) && (currentItem.type !== ProjectItemType.BIN)){ // For every selected item which isn't a bin or sequence...
									allPathsToStitch += currentItem.getMediaPath();
										allPathsToStitch += ";";
								}
							}
						}

						var AMEString = "var fe = app.getFrontend(); fe.stitchFiles(\"" + allPathsToStitch + "\"";
						var addendum = ", \"H.264\", \"" + presetPath + "\", "  + "\"(This path parameter is never used)\");";

						AMEString += addendum; 

						// 3. Send Command to AME for Export //
						var bt      = new BridgeTalk();
						bt.target   = 'ame';
						bt.body = AMEString;
						bt.send();


						
					}
                }
            }
        }
	},

	clearESTKConsole : function() {
		var bt 		= new BridgeTalk();
		bt.target 	= 'estoolkit-4.0';
		bt.body 	= function(){
    		app.clc();
    	}.toSource()+"()";
		bt.send();
	}
};
