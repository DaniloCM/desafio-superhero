//Captura y validación del ID a buscar es un número y esta entre 1 a 731 (3.1 - 3.2 - 3.3)
let capturaId = () => {

    // Expresión regular para solo números
    let expRegNumeros = /^[0-9]*$/;

    // Valor del input
    let id = $("#heroeInput").val();

    // Remueve las clases de validación del input
    $("#heroeInput").removeClass("is-valid is-invalid");

    // Muestra la tarjera una vez rellenada la información del heroe
    $("#info-heroe").removeClass("d-none");

    if (!expRegNumeros.test(id) || id < 1 || id > 731) {

        // Se esconde la información del heroe y le agrega al input la clase no validado
        $("#info-heroe").addClass("d-none");
        $("#heroeInput").addClass("is-invalid");

    } else {

        // Se le agrega al input la clase no validado y retorna el ID 
        $("#heroeInput").addClass("is-valid");
        return id;

    }

};


// Se muestra un mensaje cuando no hay registros de las estadísticas del heroe o cuando solo hay algunas disponibles.
let mensajeEstadisticasNull = (estadisticasNull, tarjeraHeroe) => {

    $("#menos-estadisticas").html(``);
    $("#sin-estadisticas").html(``);


    if (estadisticasNull.length == 6) {
        $("#sin-estadisticas").html(`
        No se encontraron estadísticas de ${tarjeraHeroe.nombre}
        `);
        $("#chartContainer").html(``);
    }

    if (estadisticasNull.length == 5) {
        $("#menos-estadisticas").html(`
            No se encontraron estadísticas de ${estadisticasNull.filter((v, i) => i < 4).join(", ")} y ${estadisticasNull[4]}
        `);
    }
};


// Se muestra la información y estadística del heroe en pantalla
let infoAndStatsHero = (valorInput) => {

    $.ajax({

        url: "https://www.superheroapi.com/api.php/4905856019427443/" + valorInput,

        success: function (response) {

            // Obtencion de la información a mostrar en la tarjera del heroe
            let tarjeraHeroe = {

                imagen: response.image.url,
                nombre: response.name,
                conexiones: response.connections["group-affiliation"],
                publicadoPor: response.biography.publisher,
                ocupacion: response.work.occupation,
                primeraAparicion: response.biography["first-appearance"],
                altura: response.appearance.height.join(' - '),
                peso: response.appearance.weight.join(' - '),
                alianza: response.biography.aliases.join(', ')

            };

            // Se renderiza la información del heroe (3.5 - 3.6)
            let selectorElementoTarjeta;

            for (const key in tarjeraHeroe) {

                selectorElementoTarjeta = $(`#card-${key}`);

                if (key == "imagen") {

                    selectorElementoTarjeta.attr("src", tarjeraHeroe[key]);

                } else {

                    selectorElementoTarjeta.html(tarjeraHeroe[key]);

                }

            }


            // Se crean arrays para manejar las estadísticas de los heroes y registrar las estadisiticas con valor 'null'
            let estadisticas = [];
            let estadisticasNull = [];

            // Se transforma la información de las estadísticas de objeto a array
            let propiedadesPowerStats = Object.entries(response.powerstats);

            // Se seperan las estadísticas con información con las que no
            propiedadesPowerStats.forEach(elem => {

                if (elem[1] !== 'null') {
                    estadisticas.push({
                        y: elem[1],
                        label: elem[0]
                    });
                } else {
                    estadisticasNull.push(elem[0]);
                }
            });

            // Se muestran un gráfico de torta con las estadisiticas del heroe, si es que existen(3.7)
            if (estadisticasNull.length < 6) {
                let config = {
                    theme: "light2", // "light1", "light2", "dark1", "dark2"
                    animationEnabled: true,
                    title: {
                        text: `Estadísticas de Poder para ${tarjeraHeroe.nombre}`
                    },
                    data: [{
                        type: "pie",
                        startAngle: 25,
                        toolTipContent: "<b>{label}</b>: {y}",
                        showInLegend: "true",
                        legendText: "{label}",
                        indexLabelFontSize: 16,
                        indexLabel: "{label} ({y})",
                        dataPoints: estadisticas
                    }]
                };


                var chart = new CanvasJS.Chart("chartContainer", config);

                chart.render();

                // Al tener position absolute el grafico sobre sale, por lo cual hay que agregar un margen a la columna de este para que no sobresalga
                $('#grafico-heroe').css("margin-bottom", "450px");
            } else {
                // Si no hay un gráfico no es necesario el margen extra
                $('#grafico-heroe').css("margin-bottom", "0");
            }


            // Se muestra un mensaje cuando no hay registros de las estadísticas del heroe o cuando solo hay algunas disponibles.
            mensajeEstadisticasNull(estadisticasNull, tarjeraHeroe);
        }
    });

};


$(() => { // Función Ready

    $("form").submit(function (e) {
        e.preventDefault();

        // Captura y validación del ID a buscar (3.1 - 3.2 - 3.3)
        let valorInput = capturaId();

        // Si se valida el ID se empieza a procesar la información del heroe, y se muestra la información y estadistica de este
        if (valorInput !== undefined) {

            // Se muestra la información y estadística del heroe en pantalla
            infoAndStatsHero(valorInput);

            // Se realiza un scroll al top de la información del heroe cuando se encuentra
            $('html, body').animate({
                scrollTop: $("#info-heroe").offset().top
            }, 1000);
        }
    });
});