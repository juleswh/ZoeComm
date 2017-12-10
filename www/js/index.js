var app = {
    //a json-formated configuration
    //TODO: document this well
    //TODO: read from file
    config: {
        "home":{
            "element1":{
                "img":"img/animal.jpg",
                "text":"",
                "next":"animaux"
            },
            "element2":{
                "img":"http://placehold.it/650x800",
                "text":"",
                "next":"music"
            }
        },
        "animaux":{
            'elements':
                [
                {
                    "img":"https://upload.wikimedia.org/wikipedia/commons/c/c3/Chat_mi-long.jpg",
                    "text":"",
                    "next":"chats"
                },
                {
                    "img":"https://upload.wikimedia.org/wikipedia/commons/d/d5/Vulpes_vulpes_sitting.jpg",
                    "text":"",
                    "next":"renard"
                }
            ]
        },
        "chats":{
            "img":"https://upload.wikimedia.org/wikipedia/commons/c/c3/Chat_mi-long.jpg"
        },
        "renard":{
            "img":"https://upload.wikimedia.org/wikipedia/commons/d/d5/Vulpes_vulpes_sitting.jpg"
        },
        "music":{
            "element1":{
                "img":"http://placehold.it/600x200",
                "text":"",
                "next":"rock"
            },
            "element2":{
                "img":"http://placehold.it/1000x1000",
                "text":"",
                "next":"reggae"
            }
        },
        "reggae":{
            'src': 'http://chai5she.cdn.dvmr.fr/fip-webradio6.mp3'
        },
        "rock":{
            "src":'http://chai5she.cdn.dvmr.fr/fip-webradio1.mp3'
        }
    },
    
    currentPage:"home",
    trail: [],
    activeElement: undefined,
    media: undefined,
    temp_elements: [],
    nexts : {},
    // Application Constructor
    initialize: function() {
        if(!window.cordova){
            this.onDeviceReady();
        }else{
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        }
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        var imgs=document.getElementsByClassName('img');
        var i;
        for (i = 0; i < imgs.length; i++) {
            imgs[i].addEventListener('click', this.onImageClick.bind(this));
        }
        var backbtns=document.getElementsByClassName('back-btn');
        for (i = 0; i < backbtns.length; i++) {
            backbtns[i].addEventListener('click', this.onBackButtonClick.bind(this));
        }
        this.update();
        
    },
    
    onBackButtonClick: function(event) {
        if (this.trail.length > 0){
            this.goBack();
        }
    },

    goBack: function() {
        console.log(this.trail);
        this.currentPage=this.trail.pop();
        console.log(this.currentPage);
        this.update();
    },

    onImageClick: function(event) {
        element=event.currentTarget;
        console.log(element.id+' in '+ this.currentPage +' links to '+this.nexts[element.id]);
        this.trail.push(this.currentPage);
        this.currentPage=this.nexts[element.id];
        this.nexts={};
        this.update();
    },
   
    // update the page when an object is clicked, according to the config
    update: function() {
        this.activeElement.style.display="none";
        this.updateBackButton();
        if(this.media){this.media.stop();}
        for ( i in this.temp_elements ) {
            var elem=document.getElementById(this.temp_elements[i]);
            elem.parentNode.removeChild(elem);
        }
        this.temp_elements.length=0;
        if (this.config[this.currentPage].element1){
            this.updateImageContainer();
        }else if(this.config[this.currentPage].elements){
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
    // update the page with a grid of pictures
    // TODO: for now only 2 elements allowed
    // TODO: return policy
    updateImageContainer: function(){
        this.activeElement=document.getElementById('img-container');
        this.activeElement.style.display='flex';
        element1=document.getElementById("element1");
        element2=document.getElementById("element2");
        this.nexts["element1"]=this.config[this.currentPage].element1.next;
        this.nexts["element2"]=this.config[this.currentPage].element2.next;
        element1.style.display='flex'
        element2.style.display='flex'
        element1.textContent=this.config[this.currentPage].element1.text;
        element2.textContent=this.config[this.currentPage].element2.text;
        element1.style.backgroundImage='url("'+this.config[this.currentPage].element1.img+'")';
        element2.style.backgroundImage='url("'+this.config[this.currentPage].element2.img+'")';
    },

    updateImageElements:function(){
        this.activeElement=document.getElementById('img-container');
        this.activeElement.style.display='flex';
        for(var i=0; i<this.config[this.currentPage].elements.length;i++){
            div=document.createElement("div");
            div.classList.add('img');
            div.addEventListener('click', this.onImageClick.bind(this));
            div.id="elemen"+i;
            this.nexts[div.id]=this.config[this.currentPage].elements[i].next;
            this.temp_elements.push(div.id)
            div.style.backgroundImage='url("'+this.config[this.currentPage].elements[i].img+'")';
            this.activeElement.appendChild(div);
        }
        element1=document.getElementById("element1");
        element2=document.getElementById("element2");
        element1.style.display="none";
        element2.style.display="none";
    },
    
    // update the page with an end image:
    // i.e. only one big image
    // TODO: return policy
    updateImage: function(){
        this.activeElement=document.getElementById("end-img-container");
        this.activeElement.style.display="flex";
        imgElement=document.getElementById("end-image");
        imgElement.setAttribute("src",this.config[this.currentPage].img);
    },

    updateMusic: function(){
        this.activeElement=document.getElementById("music-container");
        this.activeElement.style.display="flex";

        console.log('media:');
        console.log(Media);
        if(this.media){ delete this.media;}
        this.media = new Media(this.config[this.currentPage].src);
        this.media.play();

        //document.getElementById("audio-source").setAttribute("src",this.config[this.currentPage].src);
    },
    
    updateYoutube: function(){
        this.activeElement=document.getElementById("youtube-container");
        this.activeElement.style.display="flex";

        document.getElementById("youtube-frame").setAttribute("src",this.config[this.currentPage].youtube);
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = document.querySelector('#img-container');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:flex;');
        
        this.activeElement=receivedElement;
        this.update();

        console.log('Received Event: ' + id);
    }
};

app.initialize();
