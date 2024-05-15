var base_url = 'https://cosmolingo.studio';
var words_list = [];
var shuffled_list = [];
var tag_list = [];
var guess_index = 0;
var correct_guesses = 0;
var total_guesses = 0;
var letter_duration = new Array(100).fill(0);

var languages = ['kazakh','russian','french','korean'];
var colors = [['#7db1db','#5092c8'],['#ffb361','#ff9829'],['#c499e0','#a463ce'],['#f2e269','#e3b713'],['#e8766d','#d7544a']];
var alphabets = [
    ["а","ә","б","в","г","ғ","д","е","ж","з","и","й","к","қ","л","м","н","ң","о","ө","п","р","с","т","у","ұ","ү","ф","х","һ","ц","ч","ш","щ","ы","і","э","ю","я"],
    ["а","ә","б","в","г","ғ","д","е","ж","з","и","й","к","қ","л","м","н","ң","о","ө","п","р","с","т","у","ұ","ү","ф","х","һ","ц","ч","ш","щ","ы","і","э","ю","я"],
    ["a","b","c","d","e","é","è","ê","ë","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
    []
];
var pron_alphabets = [
    ["а","ә","б","в","г","ғ","д","е","ж","з","и","й","к","қ","л","м","н","ң","о","ө","п","р","с","т","у","ұ","ү","ф","х","һ","ц","ч","ш","щ","ы","і","э","ю","я"],
    ["а","ә","б","в","г","ғ","д","е","ж","з","и","й","к","қ","л","м","н","ң","о","ө","п","р","с","т","у","ұ","ү","ф","х","һ","ц","ч","ш","щ","ы","і","э","ю","я"],
    ["a","an","b","ch","d","e","é","è","eu","f","g","i","in","j","k","l","m","n","o","oa","on","ou","p","r","s","t","u","v","x","y","z"],
    []
];

var special_numbers = [
    {0:'нөл',1:'бір',2:'екі',3:'үш',4:'төрт',5:'бес',6:'алты',7:'жеті',8:'сегіз',9:'тоғыз',10:'он',
    20:'жиырма',30:'отыз',40:'қырық',50:'елу',60:'алпыс',70:'жетпіс',80:'сексен',90:'тоқсан',100:'жүз',1000:'мың'},
    {},
    {0:'zéro',1:'un',2:'deux',3:'trois',4:'quatre',5:'cinq',6:'six',7:'sept',8:'huit',9:'neuf',10:'dix',
    11:'onze',12:'douze',13:'treize',14:'quatorze',15:'quinze',16:'seize',17:'dix-sept',18:'dix-huit',19:'dix-neuf',
    20:'vingt',30:'trente',40:'quarante',50:'cinquante',60:'soixante',70:'soixante-dix',80:'quatre-vingts',90:'quatre-vingt-dix',100:'cent',1000:'mille'},
    {}
]

var lang_i = 0;
var url_lang = getUrlParameter('lang');
if (url_lang == 'ru'){
    lang_i = 1;
}
else if (url_lang == 'fr'){
    lang_i = 2;
}
else if (url_lang == 'kr'){
    lang_i = 3;
}

$(document).ready(function(){
    //Change theme color depending on the language
    document.documentElement.style.setProperty("--primary-color", colors[lang_i][0]);
    document.documentElement.style.setProperty("--secondary-color", colors[lang_i][1]);
    $('#wave_top path').attr('style','stroke: none;fill: '+colors[lang_i][0]+';');
    $('#wave_bottom path').attr('style','stroke: none;fill: '+colors[lang_i][0]+';');
    $('#title h1').html('<i class="' + languages[lang_i] + '" ></i>   My ' + languages[lang_i] + ' words   <i class="' + languages[lang_i] + '" ></i>');
    $('link[rel="icon"]').attr('href', base_url + '/src/symbols/' + languages[lang_i] + '.ico');
    //Populate grammar section based on language
    var url = base_url + "/sections/" + languages[lang_i] + ".html";	
    $.get({url: url,cache: false}).then(function(data) {
        
        var lines = data.split('\n');
        lines.splice(0,16);
        lines.splice(-2,2);
        data = lines.join('\n');

        $('#grammar').html(data);
        //Get word list and populate words section
        get_words();
        populate_numbers();
        $('#number_output p').text(special_numbers[lang_i][0]);
        setup_renderer();
    });
});

function populate_numbers(){
    for (const [index, [key, value]] of Object.entries(Object.entries(special_numbers[lang_i]))) {
        var number = $("<div>");
        number.addClass("number");
        var number_p = $("<p>").text(key);
        number.append(number_p);
        var number_p = $("<p>").text(value);
        number.append(number_p);
        number.insertBefore('#number_translate');
    }
}

function get_words(){
    var url = base_url + "/words.txt";
    $.get({url: url,cache: false}).then(function(data) {
        var lines = data.split("\n").reverse();
        var wordsDiv = $("#words");

        var total_words = 0;

        lines.forEach(function(line) {
            if (line.length == 0) {
                return;
            }
            var parts = line.split(":");
            var type    = parts[0].trim();
            var tags = [];
            var genders = [];
            if (type.includes(';')){
                tags = type.split(';')[1];
                type = type.split(';')[0];
                if (tags.includes(',')){
                    var tags_in_word = tags.split(',');
                }
                else{    
                    var tags_in_word = [tags];
                }
                for (var i = 0; i < tags_in_word.length; i++){
                    if (tag_list.includes(tags_in_word[i]) == false){
                        tag_list.push(tags_in_word[i]);
                    }
                }
            }
            if (type.includes('-')){
                genders = type.split('-')[1];
                type = type.split('-')[0];
                
                if (genders.includes(',')){
                    genders = genders.split(',');
                }
                else{
                    genders = [genders];
                }
            }
            var ka_words = parts[1].trim();
            var en_words = parts[2].trim();
            var fr_words = parts[3].trim();
            var ru_words = parts[4].trim();
            var ko_words = parts[5].trim();
            if ([ka_words,ru_words,fr_words,ko_words][lang_i] == "-") {
                return;
            }
            total_words++;
            //Add "to" in front of verbs
            var en_words_display = en_words;
            if (type == 'v'){
                var len = en_words.split(",").length;
                for (var i = 0; i < len; i++){
                    var en_word = en_words.split(",")[i];
                    en_words_display = "to " + en_word;
                }
            }
            if (fr_words.includes('(')){
                var new_fr_words = fr_words.split('(')[0];
            }
            else{
                var new_fr_words = fr_words;
            }
            words_list.push({type:type, tags:tags, genders:genders, ka_words: ka_words, en_words: en_words, fr_words: new_fr_words, ru_words: ru_words, ko_words: ko_words});
            ka_words = ka_words.replace(/,/g,", ");
            en_words = en_words.replace(/,/g,", ");
            new_fr_words = new_fr_words.replace(/,/g,", ");
            ru_words = ru_words.replace(/,/g,", ");
            ko_words = ko_words.replace(/,/g,", ");

            if (genders.length > 0 && lang_i == 2){
                if (new_fr_words.includes(', ')){
                    var fr_words = new_fr_words.split(', ');
                }
                else{
                    var fr_words = [new_fr_words];
                }
                for (var i = 0; i < fr_words.length; i++){
                    if (genders[i].length == 0){
                        continue;
                    }
                    var prep = ['le','la','les'][['m','f','p'].indexOf(genders[i])];
                    if (['a','e','i','o','u','y','é','è'].includes(fr_words[i][0])){
                        prep = ['un','une','les'][['m','f','p'].indexOf(genders[i])];
                    }
                    fr_words[i] = prep + ' ' + fr_words[i];
                }
                new_fr_words = fr_words.join(', ');
            }
            
            display_words = [ka_words,ru_words,new_fr_words,ko_words];

            var wordElement = $("<p>").text(display_words[lang_i] + ' : ' + en_words_display);
            wordElement.attr('type'    , type   );
            wordElement.attr('tags'    , tags);
            wordElement.attr('genders' , genders);
            wordElement.attr('ka_words', ka_words);
            wordElement.attr('en_words', en_words);
            wordElement.attr('fr_words', new_fr_words);
            wordElement.attr('ru_words', ru_words);
            wordElement.attr('ko_words', ko_words);
            if (fr_words != '-' && fr_words.includes('(')){
                var fr_pron = fr_words.split('(')[1].slice(0,-1).split('_');
                wordElement.attr('fr_pron' , JSON.stringify(fr_pron));
            }
            else{
                wordElement.attr('fr_pron' , '-');
            }
            wordElement.addClass("word");
            wordElement.on("click", play_word_sound);

            wordsDiv.append(wordElement);
        });
        $('#search_bar').attr('placeholder', 'Search in ' + total_words + ' words');
        $('#search_bar').val('');
        shuffled_list = shuffleArray(words_list);
        
        update_tag_filter();
        update_game_guess();
        create_body_diagram();
    });

    if ($('#alphabet').length > 0){
        populate_alphabet();
    }

    var alphabet = pron_alphabets[lang_i];
    for (var i = 0; i < alphabet.length; i++) {
        var url = base_url + '/src/sounds/' + languages[lang_i] + '/word_sounds/' + alphabet[i] + '.mp3';
        var audio = new Audio(url);
        get_audio_duration(audio,i);
        audio.src = url;
    }
}

function update_tag_filter(){
    var tag_div = $('#tags_list');
    for (var i = 0; i < tag_list.length; i++){
        var tag = $("<div>").text(tag_list[i]);
        tag.addClass('tag');
        tag_div.append(tag);
    }
    position_tag_list();
}

//Create body parts diagram
function create_body_diagram(){
    if ($('.body_parts').length == 0){
        return;
    }
    var url = base_url + "/src/body/body_parts.svg";
    
    $('#diagrams').load(url);
}

//Populate alphabet section
function populate_alphabet(){
    var alphabet = alphabets[lang_i];
    for (var i = 0; i < alphabet.length; i++) {
        var letter = $("<p>").text(alphabet[i]);
        letter.addClass("letter");
        letter.on("click", play_letter_sound);
        $("#alphabet").append(letter);
    }
}

$(document).on('input','#number_input',function(e){
    var number = $(this).val();
    var translated_number = get_spelled_out_number(number);
    $('#number_output p').text(translated_number);
    var bg_colors = ["#fbc59f","#f4eb84","#c499e0","#f39f95","#a9e3bb","#a6cdf4","#e6b8b8"];
    $('#number_output').css('background-color',bg_colors[Math.floor(Math.random() * bg_colors.length)]);
});

function get_spelled_out_number(number){
    if (number > 999999){
        if (lang_i == 0){
            return 'Тым үлкен!';
        }
        else if (lang_i == 1){
            return 'Слишком большая!';
        }
        else if (lang_i == 2){
            return 'Trop grand !';
        }
        else if (lang_i == 3){
            return '';
        }
    }
    if (number == 0){
        return special_numbers[lang_i][0];
    }
    var translated_number = '';
    var thousands = Math.floor(number / 1000);
    var hundreds = Math.floor((number % 1000) / 100);
    var tens = Math.floor((number % 100) / 10);
    var units = number % 10;
    var lang_numbers = special_numbers[lang_i];
    var translated_number = '';
    if (thousands > 0){
        if (thousands > 1){
            if (thousands > 10){
                translated_number += get_spelled_out_number(thousands) + ' ' + lang_numbers[1000] + ' ';
            }
            else{
                translated_number += lang_numbers[thousands] + ' ' + lang_numbers[1000] + ' ';
            }
        }
        else{
            translated_number += lang_numbers[1000] + ' ';
        }
    }
    if (hundreds > 0){
        if ((hundreds == 1 && thousands > 0) || hundreds > 1){
            translated_number += lang_numbers[hundreds] + ' ' + lang_numbers[100] + ' ';
        }
        else{
            translated_number += lang_numbers[100] + ' ';
        }
    }
    if (tens*10 + units in lang_numbers && tens*10 + units != 0){
        translated_number += lang_numbers[tens*10 + units];
    }
    else{
        if (tens > 0){
            translated_number += lang_numbers[tens*10] + ' ';
        }
        if (units > 0){
            translated_number += lang_numbers[units];
        }
    }
    return translated_number;
}

$(document).on('click','.section h2',function(e){
    $(this).attr('active',$(this).attr('active') == 'true' ? 'false' : 'true');
    console.log($(this).siblings('.content'));
    if ($(this).attr('active') == 'true'){
        $(this).siblings('.content').css('height','auto');
    }
    else{
        $(this).siblings('.content').css('height','0px');
    }
});

$(document).on('click','#filter_tags',function(e){
    if ($('#tags_list').is(':visible')){
        $(this).attr('active','false');
        $('#tags_list').fadeOut();
    }
    else{
        $(this).attr('active','true');
        $('#tags_list').fadeIn();
    }
});

$(document).on('click','.tag',function(e){
    var filter = 'Tags';
    if ($(this).html() != 'All'){
        filter = $(this).html();
    }
    else{
        $('#filter_tags').attr('active','false');
    }
    $('.tag-filter p').html(filter);
    $('#tags_list').fadeOut();
    update_word_list();
});

$(document).on('mousemove','.body_parts',function(e){
    body_info();
});

$(document).on('click','.body_parts',function(e){
    body_info();
});

$(document).on('click','.filter',function(e){
    $(this).attr('active',$(this).attr('active') == 'true' ? 'false' : 'true');
    update_word_list();
});

$(window).resize(function() {
    position_tag_list();
});

function position_tag_list(){
    var filter_tags = $('#filter_tags');
    var tags_list = $('#tags_list');
    tags_list.css('top',filter_tags.offset().top + filter_tags.height() + 15);
    tags_list.css('left', filter_tags.offset().left + filter_tags.outerWidth() / 2 - tags_list.outerWidth() / 2);
}

function body_info(){
    var bodyInfo = $('#body_info');
    var nbhovered = $('polygon:hover').length;
    if (nbhovered == 0) {
        bodyInfo.css('height','0px');
        bodyInfo.css('width','0px');
        bodyInfo.css('opacity','0');
    }
    else {
        bodyInfo.css('opacity','1');
        bodyInfo.css('height','50px');
        bodyInfo.css('width','100px');
        var en_name = $('polygon:hover').attr('name');
        var translated_name = '';
        $('.word').each(function(){
            var attr = 'ka_words';
            if (lang_i == 1){
                attr = 'ru_words';
            }
            else if (lang_i == 2){
                attr = 'fr_words';
            }
            else if (lang_i == 3){
                attr = 'ko_words';
            }
            var en_words = $(this).attr('en_words').split(', ');
            
            if (en_words.includes(en_name)){
                translated_name = $(this).attr(attr);
            }
        });
        if (translated_name == ''){
            $('#body_info p').html($('polygon:hover').attr('name'));
        }
        else{
            $('#body_info p').html($('polygon:hover').attr('name') + ' : ' + translated_name);
        }
    }
    var mouseX = event.pageX - 50;
    var mouseY = event.pageY + 30;
    bodyInfo.css({top: mouseY, left: mouseX});
}

function update_word_list(){
    var searchValue = $('#search_bar').val().toLowerCase();
    var filters = [false,false,false,false];
    $('.filter').each(function(i,e){
        filters[i] = $(e).attr('active') == 'true';
    });
    $(".word").each(function() {
        var type = $(this).attr("type");
        var ka_words = $(this).attr("ka_words").toLowerCase();
        var en_words = $(this).attr("en_words").toLowerCase();
        var fr_words = $(this).attr("fr_words").toLowerCase();
        var ru_words = $(this).attr("ru_words").toLowerCase();
        var ko_words = $(this).attr("ko_words").toLowerCase();
        lang_words = [ka_words,ru_words,fr_words,ko_words];
        if (type == 'v'){
            var len = en_words.split(",").length;
            for (var i = 0; i < len; i++){
                var en_word = en_words.split(",")[i];
                en_words = en_words + "," + "to " + en_word;
            }
        }
        if (lang_words[lang_i].includes(searchValue) || en_words.includes(searchValue)) {
            var type_i = ['n','v','a','o'].indexOf(type);
            if ((filters[type_i]) || (filters.includes(true) == false)){
                if ($('.tag-filter p').html() != 'Tags'){
                    if ($(this).attr('tags').split(',').includes($('.tag-filter p').html())){
                        $(this).show();
                    }
                    else{
                        $(this).hide();
                    }
                }
                else{
                    $(this).show();
                }
            }
            else{
                $(this).hide();
            }
        } else {
            $(this).hide();
        }
    });
}

//Search bar behaviour
$("#search_bar").on("input", function() {
    update_word_list();
});

//Guess input behaviour
$('#guess_input').on('keypress', function(e) {
    if(e.which != 13) {//Only listen to enter key
        return;
    }
    if (guess_index >= words_list.length) {
        return;
    }
    var guess = $(this).val().toLowerCase();
    var en_words = $('#guess_word').attr('en_words').toLowerCase().split(",");
    var en_words_possible = en_words.slice();
    if ($('#guess_word').attr('type') == 'v'){
        var len = en_words.length;
        for (var i = 0; i < len; i++){
            var en_word = en_words[i];
            en_words_possible.push('to ' + en_word);
            en_words[i] = 'to ' + en_word;
        }
    }
    
    guess = guess.replace("?", "");
    en_words_possible = en_words_possible.map(word => word.replace("?", ""));

    $('#guess_result').css('opacity',1);
    var time = 500;
    if ((en_words_possible.includes(guess))){
        $("#guess_result").text("Correct!");
        correct_guesses++;
    } else {
        if (guess.length == 0) {
            $("#guess_result").text("It was " + en_words);
        }
        else{
            $("#guess_result").text("Nope, it was " + en_words);
        }
        time = 2500;
    }

    guess_index++;
    total_guesses++;
    update_progress_bar();
    update_game_guess();
    if (guess_index >= words_list.length) {
        $("#guess_result").text("Game finished! Click to restart.");
        $('#guess_result').css('cursor','pointer');
        $('#guess_result').animate({ opacity: 1 });
        $("#guess_result").on("click", function() {
            guess_index = 0;
            correct_guesses = 0;
            total_guesses = 0;
            shuffled_list = shuffleArray(words_list);
            update_progress_bar();
            update_game_guess();
            $('#guess_result').css('cursor','default');
            $('#guess_result').animate({ opacity: 0 });
            $('#guess_result').off("click");
            $('#guess_input').focus();
        });
    }
    else{
        setTimeout(function() {
            $('#guess_result').animate({ opacity: 0 });
        }, time);
    }
});

function update_game_guess() {
    if (guess_index >= words_list.length) {
        return;
    }
    var word = shuffled_list[guess_index];
    var words = [word.ka_words,word.ru_words,word.fr_words,word.ko_words];
    $("#guess_word p").text(words[lang_i]);
    $('#guess_word').attr('type', word.type);
    $('#guess_word').attr('ka_words', word.ka_words);
    $('#guess_word').attr('en_words', word.en_words);
    $('#guess_word').attr('fr_words', word.fr_words);
    $('#guess_word').attr('ru_words', word.ru_words);
    $('#guess_word').attr('ko_words', word.ko_words);
    var col = $('.word[ka_words="' + word.ka_words + '"]').css('background-color');
    $("#guess_word").css("background-color", col);
    $("#guess_input").val("");
}

function update_progress_bar() {
    var progress = correct_guesses / words_list.length * 100;
    var progress_total = total_guesses / words_list.length * 100;
    var good_guesses = correct_guesses / total_guesses * 100;
    if (total_guesses == 0) {
        good_guesses = 0;
    }
    $("#progress_div .progress").css("width", progress + "%");
    $("#progress_div .progress_total").css("width", progress_total + "%");
    $("#progress_div p").text(correct_guesses + " / " + total_guesses + " (" + good_guesses.toFixed(0) + "%)");
    $('#progress_div p').css('left', progress + '%');
    $('#progress_div p').css('opacity', 1);
    $('#progress_div').css('opacity', 1);
}

function play_audio_index(url,time){
    setTimeout(function() {
        var audio = new Audio(url);
        audio.play();
    }, time * 1000);
}

function play_word_sound(){
    if (lang_i == 0){
        var letters = $(this).attr('ka_words').split("");
    }
    else if (lang_i == 1){
        var letters = $(this).attr('ru_words').split("");
    }
    else if (lang_i == 2){
        if ($(this).attr('fr_pron') == '-'){
            return;
        }
        var letters = JSON.parse($(this).attr('fr_pron'));
    }
    else if (lang_i == 3){
        var letters = $(this).attr('ko_words').split("");
    }
    var total_duration = 0;
    var alphabet = pron_alphabets[lang_i];
    for (var i = 0; i < letters.length; i++) {
        if (letters[i] == " ") {
            total_duration += 0.25;
            continue;
        }
        else if (alphabet.indexOf(letters[i].toLowerCase()) == -1) {
            continue;
        }
        var letter = letters[i].toLowerCase();
        var url = base_url + '/src/sounds/' + languages[lang_i] + '/word_sounds/' + letter + '.mp3';
        var audio = new Audio(url);
        audio.src = url;
        play_audio_index(url,total_duration);
        total_duration += letter_duration[alphabet.indexOf(letter)];
    }
}

function play_letter_sound(){
    var audio = new Audio(base_url + '/src/sounds/' + languages[lang_i] + '/letter_sounds/' + $(this).html() + '.mp3');
    audio.play();
}

function get_audio_duration(audio,i){
    $(audio).on("loadedmetadata", function(){
        letter_duration[i] = Math.max(audio.duration,0.15);
    });
}

function shuffleArray(array) {
    var newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};