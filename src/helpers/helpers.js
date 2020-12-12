const hbs = require('hbs');

hbs.registerHelper('listar', (listado, placa) => {
    let texto = ``;
    listado.forEach(vehiculo => {
        if (vehiculo.placa == placa) {
            texto += `<option value="${vehiculo.placa}" selected>${vehiculo.placa}</option>`
        } else {
            texto += `<option value="${vehiculo.placa}">${vehiculo.placa}</option>`
        }
    })
    return texto;
});

hbs.registerHelper('misPublicaciones', (lista, agricultor) => {
    let texto = ``;
    lista.forEach(publicacion => {
        if (publicacion.agricultor == agricultor) {
            texto += `<div class="row" style="border-radius: 20px; border: 1px solid black; background-color: white; margin-bottom: 30px;">
		<div class="col my-auto">
		  <img src="data:img/png;base64,${publicacion.image.toString("base64")}" style="max-width: 200px;">
		</div>
		<div class="col-8 my-auto">
		  <h2 class="text-center">${publicacion.nombreProducto}</h2><br>
		  ${publicacion.about}
		</div>
		<div class="col my-auto">
		  <form action="/editPublication" method="post">
			  <input name="editar" type="hidden" value="${publicacion.nombreProducto}">
			<button class="btn btn-success agroboton divi buttoni" style="width: 100%; margin-top: 5px;">Editar</button>
		  </form>
		  <form action="/viewPublication" method="post">
		  	<input name="ver" type="hidden" value="${publicacion.nombreProducto}">
			<button class="btn btn-success agroboton divi buttoni"
			  style="width: 100%; margin-top: 5px; margin-bottom: 5px;">Ver</button>
		  </form>
		  <form action="/deletePublication" method="post">
		 	<input name="eliminar" type="hidden" value="${publicacion.nombreProducto}">
			<button class="btn btn-danger divi buttoni" style="width: 100%; margin-bottom: 5px;">Eliminar</button>
		  </form>
		</div>
	  </div>`
        }
    });
    return texto;
});

hbs.registerHelper('todasPublicaciones', (lista) => {
    let texto = ``;
    lista.forEach(publicacion => {
        texto += `<div class="row" style="border-radius: 20px; border: 1px solid black; background-color: white; margin-bottom: 30px;">
		<div class="col my-auto">
		  <img src="data:img/png;base64,${publicacion.image.toString("base64")}" style="max-width: 200px;">
		</div>
		<div class="col-8 my-auto">
		  <h2 class="text-center">${publicacion.nombreProducto}</h2><br>
		  ${publicacion.about}
		</div>
		<div class="col my-auto">
		  <form action="/viewPublication" method="post">
			<button class="btn btn-success agroboton divi buttoni"
			  style="width: 100%; margin-top: 5px; margin-bottom: 5px;" value="${publicacion.nombreProducto}" name="ver">Ver</button>
		  </form>
		</div>
	  </div>`
    });
    return texto;
});