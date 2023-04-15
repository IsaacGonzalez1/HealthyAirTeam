const citySelect = document.getElementById('city-select');
const typeDataSelect = document.getElementById('typeData-select');
const resultsContainer = document.getElementById('results');

// Agregar un evento de cambio al select de tipo de datos
typeDataSelect.addEventListener('change', () => {
  // Obtener el tipo de datos seleccionado
  const dataType = typeDataSelect.value;

  // Verificar si el tipo de datos es "Calidad del aire"
  if (dataType === 'calidad-aire') {
    // Agregar un evento de cambio al select de ciudades
    citySelect.addEventListener('change', () => {
      // Obtener la ciudad seleccionada
      const city = citySelect.value;

      // Hacer una solicitud a la API Openaq con la ciudad seleccionada
      fetch(`https://api.openaq.org/v1/latest?city=${city}`)
        .then(response => response.json())
        .then(data => {
          // Mostrar el primer resultado en la pantalla
          const results = data.results[0];
          
          const resultHtml = `
            <div>
              <p>Ciudad: ${results.city}</p>
              <p>País: ${results.country}</p>
              <p>Ubicación: ${results.location}</p>
              <p>Parámetro: ${results.measurements[0].parameter}</p>
              <p>Valor: ${results.measurements[0].value} ${results.measurements[0].unit}</p>
              <p>Fecha: ${results.measurements[0].lastUpdated}</p>
              <p>Coordenadas: Latitud: ${results.coordinates.latitude}, Longitud: ${results.coordinates.longitude}</p>
            </div>`;
          resultsContainer.innerHTML = resultHtml;

        })
        .catch(error => {
          console.error(error);
          resultsContainer.innerHTML = 'Hubo un error al buscar los resultados';
        });
    });
  } else {
    // Si el tipo de datos no es "Calidad del aire", borrar el evento de cambio del select de ciudades
    citySelect.removeEventListener('change', () => {});
    resultsContainer.innerHTML = '';
  }
});

// Hacer una solicitud a la API OpenAQ para obtener la lista de ciudades de España
fetch('https://api.openaq.org/v1/cities?limit=10000')
  .then(response => response.json())
  .then(data => {
    // Crear opciones para cada ciudad
    for (const city of data.results) {
      if (city.country === 'ES') {
        const option = document.createElement('option');
        option.value = city.city;
        option.textContent = city.city;
        citySelect.appendChild(option);
      }
    }
  })
  .catch(error => {
    console.error(error);
    resultsContainer.innerHTML = 'Hubo un error al buscar los resultados';
  });

// Agregar un evento de clic al botón de búsqueda para borrar el resultado actual
const searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', () => {
  resultsContainer.innerHTML = '';
});
