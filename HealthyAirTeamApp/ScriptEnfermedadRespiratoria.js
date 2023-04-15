// Agregar un evento de cambio al select de tipo de datos
typeDataSelect.addEventListener('change', () => {
    // Obtener el tipo de datos seleccionado
    const dataType = typeDataSelect.value;
    const cities = {
        'Albacete': '02003',
        'Almería': '04013',
        'Araba/Álava': '01001',
        'Alicante/Alacant': '03014',
        'Asturias': '33003',
        'Ávila': '05019',
        'Badajoz': '06015',
        'Islas Baleares': '07040',
        'Barcelona': '08019',
        'Bizkaia': '48020',
        'Burgos': '09059',
        'Cáceres': '10039',
        'Cádiz': '11012',
        'Cantabria': '39075',
        'Castellón': '12040',
        'Ceuta': '51001',
        'Ciudad Real': '13038',
        'Córdoba': '14021',
        'A Coruña': '15030',
        'Cuenca': '16069',
        'Gipuzkoa': '20069',
        'Girona': '17079',
        'Granada': '18087',
        'Guadalajara': '19087',
        'Huelva': '21041',
        'Huesca': '22120',
        'Jaén': '23050',
        'León': '24089',
        'Lugo': '27028',
        'Lleida': '25120',
        'Madrid': '28079',
        'Málaga': '29067',
        'Melilla': '52001',
        'Murcia': '30030',
        'Navarra': '31201',
        'Ourense': '32054',
        'Palencia': '34120',
        'Pontevedra': '36038',
        'La Rioja': '26089',
        'Salamanca': '37274',
        'Santa Cruz de Tenerife': '38038',
        'Segovia': '40004',
        'Sevilla': '41091',
        'Soria': '42173',
        'Tarragona': '43148',
        'Teruel': '44135',
        'Toledo': '45168',
        'Valencia': '46250',
        'Valladolid': '47186',
        'Zamora': '49275',
        'Zaragoza': '50297'
    };

    // Verificar si el tipo de datos es "Calidad del aire y enfermedades respiratorias"
    if (dataType === 'air-quality-respiratory-diseases') {
        // Agregar un evento de cambio al select de ciudades
        citySelect.addEventListener('change', () => {
            // Obtener la ciudad seleccionada
            const city = citySelect.value;
            const cityCode = cities[city];

            // Realizar la llamada a la API de AEMET
            const weatherPromise = fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${cityCode}/?api_key=TU_API_KEY`)
                .then(response => response.json())
                .then(data => {
                    const datosUrl = data.datos;
                    return fetch(datosUrl);
                })
                .then(response => response.json());

            // Realizar la llamada a la API de OpenAQ
            const airQualityPromise = fetch(`https://api.openaq.org/v1/latest?city=${city}`)
                .then(response => response.json());

            // Procesar los resultados de ambas APIs
            Promise.all([weatherPromise, airQualityPromise])
                .then(([weatherData, airQualityData]) => {
                    // Procesar los datos meteorológicos
                    const temperatureMax = weatherData[0].prediccion.dia[0].temperatura.maxima;
                    const humidity = weatherData[0].prediccion.dia[0].humedadRelativa.maxima;

                    // Procesar la información sobre la calidad del aire
                    const pm10 = airQualityData.results[0].measurements.find(measurement => measurement.parameter === 'pm10');
                    const pm25 = airQualityData.results[0].measurements.find(measurement => measurement.parameter === 'pm25');
                    const pm10Value = pm10 ? pm10.value : null;
                    const pm25Value = pm25 ? pm25.value : null;

                    // Calcular el riesgo de contraer enfermedades respiratorias infecciosas
                    let NiveldeRiesgo = '';
                    let RecomendacionesRiesgo = '';
                    let posiblesEnfermedades = '';

                    if (pm10Value > 75 || pm25Value > 50) {
                        NiveldeRiesgo = 'Muy alto';
                        posiblesEnfermedades = 'Posibles enfermedades: neumonía, bronquitis aguda, exacerbación del asma.';
                        RecomendacionesRiesgo = 'Las condiciones son desfavorables para las personas con enfermedades respiratorias. Evita salir al aire libre, especialmente durante las horas pico de contaminación. Mantén las ventanas cerradas y utiliza un purificador de aire en tu hogar. Utiliza una mascarilla de calidad cuando salgas y sigue un plan de acción para enfermedades respiratorias proporcionado por tu médico.';
                    } else if (temperatureMax > 35 || (pm10Value > 60 || pm25Value > 35)) {
                        NiveldeRiesgo = 'Alto';
                        posiblesEnfermedades = 'Posibles enfermedades: infección por el virus sincitial respiratorio (VSR), exacerbación de la enfermedad pulmonar obstructiva crónica (EPOC), infección por adenovirus.';
                        RecomendacionesRiesgo = 'Evita actividades al aire libre, especialmente en lugares concurridos. Mantén las ventanas cerradas y utiliza un purificador de aire en interiores. Lávate las manos con frecuencia y evita tocarse la cara. Usa una mascarilla en lugares cerrados y concurridos. Mantén tu sistema inmunológico fuerte mediante una dieta saludable, ejercicio regular y suficiente sueño.';
                    } else if (pm10Value > 50 || pm25Value > 25 || humidity > 70) {
                        NiveldeRiesgo = 'Medio';
                        posiblesEnfermedades = 'Posibles enfermedades: gripe.';
                        RecomendacionesRiesgo = 'Limita tu tiempo al aire libre y evita lugares concurridos. Lávate las manos con frecuencia y evita tocarse la cara. Usa una mascarilla en lugares cerrados y concurridos. Mantén tu sistema inmunológico fuerte mediante una dieta saludable, ejercicio regular y suficiente sueño.';
                    } else {
                        NiveldeRiesgo = 'Bajo';
                        posiblesEnfermedades = 'Las condiciones son favorables, pero sigue las recomendaciones de tu médico.';
                        RecomendacionesRiesgo = 'Mantén un estilo de vida saludable y sigue las pautas generales de prevención de enfermedades respiratorias.';
                    }

                    // Mostrar el nivel de riesgo en el contenedor
                    resultsContainer.innerHTML = `
                      <p>Riesgo de contraer enfermedades respiratorias: ${NiveldeRiesgo}</p>
                      <p>${posiblesEnfermedades}</p>
                      <p>Recomendaciones: ${RecomendacionesRiesgo}</p>
                    `;
                })
                .catch(error => {
                    console.log(error);
                    resultsContainer.innerHTML = 'Hubo un error al buscar los resultados';
                });
        });
    } else {
        citySelect.removeEventListener('change', () => { });
        resultsContainer.innerHTML = '';
    }
});
