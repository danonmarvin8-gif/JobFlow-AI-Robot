function calcul_moyenne() {
var n1 = prompt("donner la première note sur 20");
var n2 = prompt("Donner la deuxième note sur 20");
var n3 = prompt("donner la trosième note sur 20");

var somme = Number(n1) + Number(n2) + Number(n3);

document.write("Voici la somme :" + somme + "<br>");

var moyenne = somme/3

document.write("Voici la moyenne:" + moyenne + "<br>");

if (moyenne < 10) {
document.write("Redoublant");

}

else if(moyenne<12) {

    document.write("Admis – Passable");
}

else if(moyenne<14) {
    document.write("Admis – Bien");

}

else if(moyenne>=14) {
    document.write("Admis – Très bien");

}

}   

function test_temperature() {
var temperature = prompt("saisissez une température (en °C)");
if (temperature < 10) {
    document.write("Froid");
    document.bgColor="blue";
}

else if(temperature<25) {
    document.write("Normal");
    document.bgColor="green";

}

else if(temperature>25) {
    document.write("Chaud");
    document.bgColor="orange";

}

}

function comparer_nombre() {
var nombre = prompt("Saisissez deux nombres");
var n1 = prompt("Donner le premier nombre");
var n2 = prompt("Donner le deuxième nombre");
    


if(n1<n2) {
    document.write("Le nombre le plus petit est "+n1+" Le nombre le plus grand est "+n2+"");
    document.write('<br><button onclick="window.location.href=\'index.html\'">Retour</button>');

}

else if(n2<n1) {
    document.write("Le nombre le plus petit est "+n2+" Le nombre le plus grand est "+n1+"");
    document.write('<br><button onclick="window.location.href=\'index.html\'">Retour</button>');

}

else if(n1=n2) {
    document.write("Les deux nombres sont égaux");
    document.write('<br><button onclick="window.location.href=\'index.html\'">Retour</button>');

}


}

