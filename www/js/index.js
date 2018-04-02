
function onErrorReadFile(err){
}
function onErrorGetDir(err) {}

function onErrorCreateFile(err) {}
function onErrorLoadFs(err){
    console.log("load fs error");
}

const readFile = (fileEntry) =>
    new Promise((resolve,reject) => {

        //console.log("readFile fileEntry=");
        //console.log(fileEntry);
    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            //console.log("Successful file read: ");
            //console.log(fileEntry.fullPath + ": " + this.result);
            var dataObj=JSON.parse(this.result);
            resolve(dataObj);
        };
        reader.readAsText(file);
    }, reject);
});


function writeFile(fileEntry, dataObj,successCallback) {
    // Create a FileWriter object for our FileEntry (log.txt).
    //console.log("writeFile -> fileEntry:");
    //console.log(fileEntry);
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            //console.log();
            //console.log("Successful file write: "+fileEntry.fullPath);
            //readFile(fileEntry);
            successCallback();
        };

        fileWriter.onerror = function (e) {
            //console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}

function createFile(dirEntry, fileName) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {

        writeFile(fileEntry, null);

    }, onErrorCreateFile);

}
const saveFile = (dirEntry, fileData, fileName) => 
    new Promise((resolve,reject) => {
        //console.log("saveFile "+dirEntry.name+"/"+fileName);
        dirEntry.getFile(fileName, { create: true, exclusive: true }, //path must not exist
            fileEntry => writeFile(fileEntry, fileData, resolve),
            e=> reject(e));
    });

const createDirectory = (rootDirEntry,directoryName) =>
    new Promise((resolve,reject) => {
        //console.log("createDirectory "+rootDirEntry.name+"/"+directoryName);
        rootDirEntry.getDirectory(directoryName, { create: true },
            dirEntry => resolve(dirEntry),
            e => reject(`Failed to create directory ${directoryName} in ${rootDirEntry.name}`)
            );
    });

/**
 * Resolve the fileEntry for a path
 * @param  {String} filePath Path
 * @return {FileEntry}       Resolved fileEntry
 */
const resolveLocalFileSystemURL = (filePath) =>
    new Promise((resolve, reject) => {
        //console.log("resolveLocalFileSystemURL "+filePath);
        window.resolveLocalFileSystemURL(
            filePath,
            fileEntry => resolve(fileEntry),
            e => reject(`Failed to resolve URL for path ${filePath}: ${JSON.stringify(e)}`)
        );
});

function imageDim(image_nb) {
    /*var elem=document.getElementById("img-list");
    var width=elem.clientWidth;
    var height=elem.clientHeight;
    var n = image_nb + image_nb % 2;
    var maxd=Math.sqrt(width*height*0.95/n);
    */
    maxd=imageDimSquare(image_nb)[0];
    return maxd;
}

function imageDimSquare(n) {
    var elem=document.getElementById("img-list");
    var w=elem.clientWidth;
    var h=elem.clientHeight;
    var l0=Math.sqrt(w*h/n);
    var c0=Math.ceil(w/l0);
    var r0=Math.ceil(h/l0);
    var d1=[c0,Math.ceil(n/c0)];
    var d2=[Math.ceil(n/r0),r0];
    //console.log("h="+h+ "w"+w);
    //console.log("d1="+d1+"  d2="+d2);
    var l_= 0.;
    var d_= [0.,0.];
    for (i in [d1,d2]){
        d=[d1,d2][i];
        //console.log("d="+d);
        var lw=w/d[0];
        var lh=h/d[1];
        var lm=Math.min(lw,lh);
        //console.log([lh,lw]);
        //console.log(lm);
        if (lm > l_){
            d_=d;
            l_=lm;
        }
    }
    return [l_,d_];
}

var app = {
    //a json-formated configuration
    //TODO: document this well
    //TODO: read from file
    config: {
        'back-btn-width':'2cm',
        "home":{
            'elements': [
                {
                    "img":"img/animal.jpg",
                    "text":"",
                    "next":"animaux"
                },
                {
                    "img":"http://placehold.it/650x800",
                    "text":"",
                    "next":"music"
                },
                {
                    "img":"img/renard.jpg",
                    "text":"",
                    "next":"renard"
                }
            ]
        },
        "animaux":{
            'elements':
                [
                {
                    "img":"img/chats.jpg",
                    "text":"",
                    "next":"chats"
                },
                {
                    "img":"img/renard.jpg",
                    "text":"",
                    "next":"renard"
                }
            ]
        },
        "chats":{
            "img":"img/chats.jpg"
        },
        "renard":{
            "img":"img/renard.jpg"
        },
        "music":{
            "elements":
                [
                {
                    "img":"img/rock.jpg",
                    "text":"",
                    "next":"rock"
                },
                {
                    "img":"http://placehold.it/1000x1000",
                    "text":"",
                    "next":"reggae"
                }
            ]
        },
        "reggae":{
            'src': 'http://chai5she.cdn.dvmr.fr/fip-webradio6.mp3'
        },
        "rock":{
            "src":'http://chai5she.cdn.dvmr.fr/fip-webradio1.mp3'
        }
    },
    
    basePath: "",
    currentPage:"home",
    trail: [],
    activeElement: undefined,
    media: undefined,
    temp_elements: [],
    nexts : {},
    images :{},

    // Application Constructor
    initialize: function() {
        if(!window.cordova){
            console.log("out of a cordova app");
            //if(localconfig){this.config = localconfig; console.log("loaded local config");}
            this.receivedEvent('deviceready');
            this.start();
        }else{
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        }
    },
    writeConfigFile: function() {
        return resolveLocalFileSystemURL(cordova.file.externalRootDirectory)
            .then(fileEntry => createDirectory(fileEntry,"ZoeComm"))
            .then(() => resolveLocalFileSystemURL(this.basePath))
            .then(dirEntry => saveFile(dirEntry, new Blob([JSON.stringify(this.config,null,'\t')],{type:"application/json"}),"config.json"))
            .then(null, fileErr => { if (fileErr.code == FileError.PATH_EXISTS_ERR) { return this.getConfigFile(); } else {console.log("Error while writing config.json");throw fileErr;}})
            .catch(err => {console.log("error while writing the configuration file : "+err); console.log(err);});
    },

    getConfigFile: function(){
        //console.log("get config file, before:");
        //console.log(this.config);
        return resolveLocalFileSystemURL(this.basePath+"config.json")
            .then(fileEntry => readFile(fileEntry))
            .then(dataObj => { this.config = dataObj; /*console.log("read file, got:");console.log(this.config);*/})
            .catch(err => console.log("error while reading the configuration file : " +err));
    },

    preLoadImages: function (obj){
        //console.log("preload Images"+JSON.stringify(obj));
        for (var key in obj){
            if (obj.hasOwnProperty(key)){
                if(key=="img"){
                    if(! this.images.hasOwnProperty(obj[key])){
                        this.images[obj[key]]=new Image();
                        this.images[obj[key]].src=this.translateUri(obj[key]);
                    }
                }else if (typeof obj[key] == 'object'){
                    //console.log(key);
                    this.preLoadImages(obj[key]);
                }
            }
        }
    },
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        //console.log("cordova.file:");
        //console.log(cordova.file);
        //console.log(cordova.file.externalRootDirectory);
        //console.log(Media);
        this.basePath = cordova.file.externalRootDirectory+'/ZoeComm/';
        this.receivedEvent('deviceready');
        //this.getConfigFile();
        this.writeConfigFile().then(() => this.start());
    },

    start: function () {
        window.addEventListener('resize',this.resizeImages.bind(this),false);
        this.preLoadImages(this.config);
        //console.log("files should have been created now");
        var imgs=document.getElementsByClassName('click-img');
        var i;
        for (i = 0; i < imgs.length; i++) {
            imgs[i].addEventListener('click', this.onImageClick.bind(this));
        }
        var backbtnwidth=this.config['back-btn-width'];
        var backbtns=document.getElementsByClassName('back-btn');
        for (i = 0; i < backbtns.length; i++) {
            backbtns[i].addEventListener('click', this.onBackButtonClick.bind(this));
            if(backbtnwidth){
                backbtns[i].style.minWidth=backbtnwidth;
            }
        }
        this.update();
        
    },
     
    translateUri: function (original) {
        if (original.search("://") > 0){
            return original;
        }else{
            return this.basePath+original;
        }
    },
    
    onBackButtonClick: function(event) {
        if (this.trail.length > 0){
            navigator.vibrate(100);
            this.goBack();
        }
    },

    goBack: function() {
        //console.log(this.trail);
        this.currentPage=this.trail.pop();
        //console.log(this.currentPage);
        this.update();
    },

    onImageClick: function(event) {
        navigator.vibrate(100);
        element=event.currentTarget;
        //console.log(element.id+' in '+ this.currentPage +' links to '+this.nexts[element.id]);
        this.trail.push(this.currentPage);
        this.currentPage=this.nexts[element.id];
        this.nexts={};
        this.update();
    },
   
    // update the page when an object is clicked, according to the config
    update: function() {
        this.activeElement.style.display="none";
        this.updateBackButton();
        if(this.media){this.media.stop(); this.media.release();}
        for ( i in this.temp_elements ) {
            var elem=document.getElementById(this.temp_elements[i]);
            elem.parentNode.removeChild(elem);
        }
        this.temp_elements.length=0;
        if(this.config[this.currentPage].elements){
            this.updateImageElements();
        }else if (this.config[this.currentPage].img){
            this.updateImage();
        }else if (this.config[this.currentPage].src){
            this.updateMusic();
        }else if (this.config[this.currentPage].youtube){
            this.updateYoutube();
        }
    },

    updateBackButton: function(){
        if(this.trail.length == 0){
            document.getElementById("back-btn").style.display="none";
        }else{
            document.getElementById("back-btn").style.display="block";
        }
    },

    resizeImages: function() {
        var backbtn_width = document.getElementById("back-btn").offsetWidth;
        var imgcontain_width=(Math.floor(document.getElementById("mainframe").clientWidth) - Math.ceil(backbtn_width))*0.99;
        document.getElementById("img-list-container").style.width=imgcontain_width+"px";

        var cells=document.getElementsByClassName("col-");
        var dimensions=imageDimSquare(cells.length);
        var dim=dimensions[1];
        for (var i=0 ; i<cells.length;++i){
            cells[i].style.width=100/dim[0]+"%";
            cells[i].style.height=100/dim[1]+"%";
        }
    },

    updateImageElements:function(){
        this.activeElement=document.getElementById('img-list');
        this.activeElement.style.display='block';
        var dimensions=imageDimSquare(this.config[this.currentPage].elements.length);
        var dim=dimensions[1];
        console.log(dimensions);
        var backbtn_width = document.getElementById("back-btn").offsetWidth;
        var imgcontain_width=(Math.floor(document.getElementById("mainframe").clientWidth) - Math.ceil(backbtn_width))*0.99;
        document.getElementById("img-list-container").style.width=imgcontain_width+"px";
        for(var i=0; i<this.config[this.currentPage].elements.length;i++){
            div=document.createElement("div");
            //div.classList.add('cell');
            div.classList.add('col-');
            div.id="cell"+i;
            div.style.width=100/dim[0]+"%";
            div.style.height=100/dim[1]+"%";
            //helper=document.createElement('span');
            //helper.classList.add('helper');
            //spacer=document.createElement('div');
            //spacer.classList.add('spacer');
            //spacer.id='spacer'+i;
            container=document.createElement("div");
            container.classList.add('element-container');
            img=document.createElement('img');
            img.id="element"+i;
            img.classList.add('img');
            img.classList.add('click-img');
            img.addEventListener('click', this.onImageClick.bind(this));
            //div.style.maxWidth = ''+maxd+'px';
            //div.style.maxHeight = ''+maxd+'px';
            //div.style.minWidth = ''+maxd*0.9+'px';
            this.nexts[img.id]=this.config[this.currentPage].elements[i].next;
            this.temp_elements.push(div.id)
            //this.temp_elements.push(spacer.id)
            //div.style.backgroundImage='url("'+this.translateUri(this.config[this.currentPage].elements[i].img)+'")';
            img.src=this.translateUri(this.config[this.currentPage].elements[i].img);
            //div.appendChild(helper);
            div.appendChild(container);
            container.appendChild(img);
            this.activeElement.appendChild(div);
            //this.activeElement.appendChild(spacer);
        }
        //var i=this.temp_elements.length-1;
        //last_spacer=document.getElementById(this.temp_elements[i]);
        //last_spacer.parentNode.removeChild(last_spacer);
        //this.temp_elements.length=i;
    },
    
    // update the page with an end image:
    // i.e. only one big image
    // TODO: return policy
    updateImage: function(){
        this.activeElement=document.getElementById("end-img-container");
        this.activeElement.style.display="block";
        imgElement=document.getElementById("end-image");
        imgElement.setAttribute("src",this.translateUri(this.config[this.currentPage].img));
    },

    loadJSON(path) {   
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', path, false);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);  
    },

    updateMusic: function(){
        this.activeElement=document.getElementById("music-container");
        this.activeElement.style.display="inline-block";

        //console.log('media:');
        //console.log(Media);
        if(this.media){ this.media.release(); delete this.media;}
        this.media = new Media(this.config[this.currentPage].src);
        this.media.play();

        //document.getElementById("audio-source").setAttribute("src",this.config[this.currentPage].src);
    },
    
    updateYoutube: function(){
        this.activeElement=document.getElementById("youtube-container");
        this.activeElement.style.display="inline-block";

        document.getElementById("youtube-frame").setAttribute("src",this.config[this.currentPage].youtube);
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = document.querySelector('#img-list');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:inline-block;');
        
        this.activeElement=receivedElement;
        this.update();

        //console.log('Received Event: ' + id);
    }
};

app.initialize();
