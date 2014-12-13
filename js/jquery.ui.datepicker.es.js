jQuery(function($){
        $.datepicker.regional['es'] = {
                closeText: 'Cerrar',
                prevText: '&#x3c;Ant',
                nextText: 'Sig&#x3e;',
                currentText: 'Hoy',
                monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
                monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun',
                'Jul','Ago','Sep','Oct','Nov','Dic'],
                dayNames: ['Domingo','Lunes','Martes','Mi&eacute;rcoles','Jueves','Viernes','S&aacute;bado'],
                dayNamesShort: ['Dom','Lun','Mar','Mi&eacute;','Juv','Vie','S&aacute;b'],
                dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','S&aacute;'],
                weekHeader: 'Sm',
                dateFormat: 'dd/mm/yy',
                firstDay: 1,
                isRTL: false,
                showMonthAfterYear: false,
                yearSuffix: ''};
        $.datepicker.setDefaults($.datepicker.regional['es']);
        
        
        
        
        $.timepicker.regional['es'] = {
        	timeOnlyTitle: 'Selecciona hora',
        	timeText: 'Hora',
        	hourText: 'Horas',
        	minuteText: 'Minutos',
        	secondText: 'Секунды',
        	millisecText: 'Миллисекунды',
        	timezoneText: 'Часовой пояс',
        	currentText: 'Ahora',
        	closeText: 'Закрыть',
        	timeFormat: 'HH:mm',
        	amNames: ['AM', 'A'],
        	pmNames: ['PM', 'P'],
        	isRTL: false
        };
        $.timepicker.setDefaults($.timepicker.regional['es']);
        
        
});