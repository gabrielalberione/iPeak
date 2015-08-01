"use strict";

function videoCapturePlus(highquality, frontcamera, duration) {
  window.plugins.videocaptureplus.captureVideo(
      captureSuccess,
      captureError,
      {
        limit: 1,
        duration: duration,
        highquality: highquality,
        frontcamera: frontcamera,
        // you'll want to sniff the useragent/device and pass the best overlay based on that.. assuming iphone here
        portraitOverlay: 'www/img/cameraoverlays/overlay-iPhone-portrait.png',
        landscapeOverlay: 'www/img/cameraoverlays/overlay-iPhone-landscape.png'
      }
  );
}
var videoUri = "";
function captureSuccess(mediaFiles) {
  document.getElementById('pluginsDemoDiv').style.display = 'block';
  var i, len;
  for (i = 0, len = mediaFiles.length; i < len; i++) {
    var mediaFile = mediaFiles[i];
    mediaFile.getFormatData(getFormatDataSuccess, getFormatDataError);

    var vid = document.createElement('video');
    vid.id = "theVideo";
    vid.width = "240";
    vid.height = "160";
    vid.controls = "controls";
    var source_vid = document.createElement('source');
    source_vid.id = "theSource";
    source_vid.src = mediaFile.fullPath;
	videoUri = mediaFile.fullPath; 
    vid.appendChild(source_vid);
    document.getElementById('video_container').innerHTML = '';
    document.getElementById('video_container').appendChild(vid);
    document.getElementById('video_meta_container2').innerHTML = parseInt(mediaFile.size / 1000) + 'KB ' + mediaFile.type;
  }
}

function getFormatDataSuccess(mediaFileData) {
  document.getElementById('video_meta_container').innerHTML = mediaFileData.duration + ' seconds, ' + mediaFileData.width + ' x ' + mediaFileData.height;
}

function captureError(error) {
  // code 3 = cancel by user
  alert('Returncode: ' + JSON.stringify(error.code));
}

function getFormatDataError(error) {
  alert('A Format Data Error occurred during getFormatData: ' + error.code);
}

function subir_video(){	
	document.getElementById('pluginsDemoDiv').style.display = 'none';
    var splashLoading = document.getElementById('splashLoading');
	splashLoading.style.display = 'block';		
	var options = new FileUploadOptions();
	options.chunkedMode = true;
	options.fileKey="file";
	options.fileName=videoUri.substr(videoUri.lastIndexOf('/')+1);
	options.mimeType="video/quicktime";
	var params = {};
	params.titulo = "prueba";	
	params.layer_id = "2";
	var pos4326 = ol.proj.transform([posActual[0], posActual[1]],'EPSG:3857','EPSG:4326');	
	params.geom = "POINT("+pos4326[0]+" "+pos4326[1]+")";	
	options.params = params;

	var ft = new FileTransfer();
	ft.upload(videoUri, encodeURI("http://190.12.101.74/ais/ipeak/ws/entidades/guardar"),
        uploadSuccess,
        uploadFail, options);
}

function envioTest(){
navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
    destinationType: Camera.DestinationType.FILE_URI });
}


function onSuccess(imageData) {
    var image = document.getElementById('myImage');
    image.src = imageURI;
	
	var options = new FileUploadOptions();
	options.chunkedMode = true;
	options.fileKey="file";
	options.fileName=videoUri.substr(videoUri.lastIndexOf('/')+1);
	options.mimeType="video/quicktime";
	var params = {};
	params.titulo = "prueba";	
	params.layer_id = "2";
	var pos4326 = ol.proj.transform([posActual[0], posActual[1]],'EPSG:3857','EPSG:4326');	
	params.geom = "POINT("+pos4326[0]+" "+pos4326[1]+")";	
	options.params = params;

	var ft = new FileTransfer();
	ft.upload(imageURI, encodeURI("http://190.12.101.74/ais/ipeak/ws/entidades/guardar"),
        uploadSuccess,
        uploadFail, options);	
}

function onFail(message) {
    alert('Failed because: ' + message);
}

function cancelar_video(){
	document.getElementById('pluginsDemoDiv').style.display = 'none';
}

function uploadSuccess(r){
    var splashLoading = document.getElementById('splashLoading');
	splashLoading.style.display = 'none';	
	alert(r);	
}

function uploadFail(error){
    var splashLoading = document.getElementById('splashLoading');
	splashLoading.style.display = 'none';		
	alert("NO!");	
}