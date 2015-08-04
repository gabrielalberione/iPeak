var map;
var view;
var overviewmapCtrol;
var urlTile;
var urlWMS;
var mapFile;
var urlGeoJson = 'http://190.12.101.74/ais/ipeak/ws/entidades/listar/2';

var posActual = [-6506141.183454158, -4110246.2464916063];
var posInicial = [-6506141.183454158, -4110246.2464916063];
var featurePosActual;

var opClick = 0;

var sourceLyBusqueda; // source utilizado para el layer medir distancia y area
var vectorLyBusqueda; // ly utilizado para medir distancia y area
var drawInteraction; // interacion para dibujar
var measureTooltip; // tooltip

var sourceLyDibujo; // source utilizado para el layer dibujar
var vectorLyDibujo; // ly utilizado para dibujar

var cantCapasBases = 0; // cantidad de capas bases que existen
var osm = null; // OpenStreetMap
var mapQuest = null; // mapQuest
var bingMapsSatelital = null;
var bingMaps = null;
var banPrimeraVez = true;

$( document ).ready( function() { 
	var lat_video = parseFloat(window.localStorage.getItem("lat_video"));
	var long_video = parseFloat(window.localStorage.getItem("long_video"));
	if((lat_video != null) && (long_video != null)){
		posInicial = [lat_video, long_video];
		posActual = [lat_video, long_video];
		window.localStorage.setItem("lat_video", "-6506141.183454158");
		window.localStorage.setItem("long_video", "-4110246.2464916063");		
	}		
	inicializar(); 
	//navigator.geolocation.getCurrentPosition(onSuccessGPS, onErrorGPS);  
    var watchID = navigator.geolocation.watchPosition(onSuccessGPS, onErrorGPS, { timeout: 3000, enableHighAccuracy: true  });
	setInterval(function() {
    	refrescarMapa();
	}, 10000);
});
$( window ).resize( function() { 
	$('#map').css("height", $( window ).height());
	map.updateSize();
});

function inicializar(){
	
	$('#map').css("height", $( window ).height());
	
	urlTile = "";
	urlWMS = "";
	mapFile = "";
		
	osm = new ol.layer.Tile({
		id: 'base_'+1,
		name: 'osm',
		type: 'base',
		title: 'Open Street Map',
		visible: true,
		source: new ol.source.OSM()
	});
	
	var layersBases = [osm];
	cantCapasBases = layersBases.length;
	/* END crea los mapas bases */
	
	view = new ol.View({
		center: posInicial,
		zoom: 16
	});
	/**/
	
	map = new ol.Map({
		target: 'map',		
		layers: layersBases,
		view: view
	});
	
	map.on('singleclick', function(evt) {
		/* verifica si hay entidades en layers tipo vector GeoJSON */
		map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
			if ((layer.get('type') != 'base') && (layer.get('nombre') != 'vectorLyBusqueda') && (layer.get('nombre') != 'vectorLyDibujo')){
				/*$('#infoEntidadTitulo').html(feature.get('nombre'));
				$('#infoEntidadCopete').html(feature.get('rubro')+'<br>'+feature.get('calle')+' '+feature.get('altura'));
				var htmlDetalle = "";
				htmlDetalle += '<b>Tel.: </b>'+feature.get('telefono')+'<br>';
				htmlDetalle += '<b>e-mail: </b>'+feature.get('email')+'<br>';
				htmlDetalle += '<b>Web: </b>'+feature.get('web')+'<br>';
				htmlDetalle += feature.get('descripcion')+'<br>';
				$('#divInfoEntidadDetalle').html(htmlDetalle);*/
				
				var ms = feature.get('Multimedias');
				//$('#infoEntidadImg').attr('src','./img/sinimagen.png');
				//$('#infoEntidadImgA').attr('href',"javascript:imageAlert('./img/sinimagen.png')");
				if (typeof ms[0] != 'undefined'){
					var m = ms[0];
					var urlimg = feature.get('MultimediasUrl')+m.Multimedia.codigo;
					var lonlat = map.getCoordinateFromPixel(evt.pixel);
					window.localStorage.setItem("link_video", urlimg);
					window.localStorage.setItem("lat_video", lonlat[0]);
					window.localStorage.setItem("long_video", lonlat[1]);
					window.open("video.html","_self");	
			//		$('#infoEntidadImg').attr('src',urlimg);	
					//alert();
					//
					//$('#embed_video').attr('src',urlimg);
					//$('#reproductor').css("height", $( window ).height()-60);
					//$("#reproductor").show();
			//		$('#infoEntidadImgA').attr('href',"javascript:imageAlert('"+urlimg+"')");		
				}
			//	$("#divInfoEntidad").show(500);
			}
		});
	});

	var vectorLayer = new ol.layer.Vector({
		id: 1,
		type: 'overlay',
		nombre: 'lugaresoficiales',
		titulo: 'Lugares oficiales', 
		mapFile: '', 
		icono: 'http://190.12.101.74/ais/ipeak/files/icons_layers/peek_play.png',
		datasource: 1,
		visible: true,
		source: new ol.source.GeoJSON({
			projection: 'EPSG:3857',
			url: urlGeoJson
		}),
		style: function(feature, resolution) {
			var iconStyle = null;
			if (true){ //(feature.get('icono') != null){
				iconStyle = [new ol.style.Style({
					image: new ol.style.Icon( ({
						anchor: [16, 32],
						anchorXUnits: 'pixels',
						anchorYUnits: 'pixels',
						opacity: 0.90,
						src: 'http://190.12.101.74/ais/ipeak/files/icons_layers/peek_play.png'
					}))
				})];
			}
			return iconStyle;
		}
	});
	
	map.addLayer(vectorLayer);	
	
	view.setCenter(posInicial);
};

/* PARAMETROS deben estar en 4326 */
function puntoGPS(xparam, yparam){	
	var pos3857 = ol.proj.transform([xparam, yparam],'EPSG:4326','EPSG:3857');
	var xAnt = posActual[0];
	var yAnt = posActual[1];
	var x = pos3857[0];
	var y = pos3857[1];
	
	posActual[0] = x;
	posActual[1] = y;
	
	if (featurePosActual == null){
		featurePosActual = new ol.Feature({
			geometry: new ol.geom.Point([x,y]),
			nombre: 'Mi posición',
			icono: 'mi_ballon.png'
		});
	
		featuresOverlay = new ol.FeatureOverlay({
			map: map,
			features: [featurePosActual]
		});
		
		var iconStyle = new ol.style.Style({
			image: new ol.style.Icon(({
				opacity: 0.75,
				src: 'iconos/mi_ballon.png'
			}))
		});
		
		featurePosActual.setStyle(iconStyle);
	} else {
		featurePosActual.setGeometry(new ol.geom.Point([x,y]));
	}
	
	if(banPrimeraVez){
		banPrimeraVez = false;
		centrarMiPosicion();
	}

}

function centrarMiPosicion(){
    view.setCenter([posActual[0],posActual[1]]);
}

function refrescarMapa(){
	var layers = map.getLayers().getArray();
	for(i=0; i < layers.length; i++){
		var ly = layers[i];
		if (ly.get('datasource') == 0){ // WMS interno
		/* puede que updateParams no exista, es por ello el try */
		try {
			ly.getSource().updateParams({time_: (new Date()).getTime()});
		} catch(err) { 
		//console.log(ly.get('nombre'));
		//console.log(err);
		}
		
		} else if (ly.get('datasource') == 1){ // Geojson
			ly.getSource().clear();
			ly.setSource(new ol.source.GeoJSON({
				projection: 'EPSG:3857',
				url: urlGeoJson
			}));
		}
	}
}
