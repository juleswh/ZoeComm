/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
            "element1":{
                "img":"https://upload.wikimedia.org/wikipedia/commons/c/c3/Chat_mi-long.jpg",
                "text":"",
                "next":"chats"
            },
            "element2":{
                "img":"https://upload.wikimedia.org/wikipedia/commons/d/d5/Vulpes_vulpes_sitting.jpg",
                "text":"",
                "next":"renard"
            }
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
                "next":"classic"
            }
        },
        "rock":{
            //"youtube":"https://www.youtube.com/embed/D_JxMb8RLEY"
            "youtube":"http://news.google.com/"
        },
        "classic":{
            "src":''
        }
    },
    
    currentPage:"home",
    trail: [],
    activeElement: undefined,
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
        
    },
    
    onBackButtonClick: function(event) {
        if (this.trail.length > 0){
            console.log("go back");
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
        console.log(element.id+' in '+ this.currentPage +' links to '+this.config[this.currentPage][element.id].next);
        this.trail.push(this.currentPage);
        this.currentPage=this.config[this.currentPage][element.id].next;
        this.update();
    },
   
    // update the page when an object is clicked, according to the config
    update: function() {
        this.activeElement.style.display="none";
        if (this.config[this.currentPage].element1){
            this.updateImageContainer();
        }else if (this.config[this.currentPage].img){
            this.updateImage();
        }else if (this.config[this.currentPage].src){
            this.updateMusic();
        }else if (this.config[this.currentPage].youtube){
            this.updateYoutube();
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
        element1.textContent=this.config[this.currentPage].element1.text;
        element2.textContent=this.config[this.currentPage].element2.text;
        //element1.setAttribute("src",this.config[this.currentPage].element1.img);
        //element2.setAttribute("src",this.config[this.currentPage].element2.img);
        element1.style.backgroundImage='url("'+this.config[this.currentPage].element1.img+'")';
        element2.style.backgroundImage='url("'+this.config[this.currentPage].element2.img+'")';
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

        document.getElementById("audio-source").setAttribute("src",this.config[this.currentPage].src);
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
