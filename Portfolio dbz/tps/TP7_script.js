function somme(){
    
    var a = document.getElementById("t1").value;
    var b = document.getElementById("t2").value;
    var c = Number(a) + Number(b);
    document.getElementById("t3").value = c;

}

function soustraction(){
    
    var a = document.getElementById("t1").value;
    var b = document.getElementById("t2").value;
    var c = Number(a) - Number(b);
    document.getElementById("t3").value = c;

}

function multiplication(){
    
    var a = document.getElementById("t1").value;
    var b = document.getElementById("t2").value;
    var c = Number(a) * Number(b);
    document.getElementById("t3").value = c;

}


function division(){
    var a = Number(document.getElementById("t1").value);
    var b = Number(document.getElementById("t2").value);
    var out = document.getElementById("t3");

    if (b === 0) {
        out.value = "Division Impossible par 0";
        return;
    }
    out.value = a / b;
}

function pair()
{
	var x = document.getElementById("t3").value
	if (x % 2 ==0){
    	document.getElementById("pair").value = " Paire "
	}
	else{
    	document.getElementById("pair").value = " Impaire "
	}
}

function permute(){
  var a = document.getElementById("t1");
  var b = document.getElementById("t2");
  var tmp = a.value;
  a.value = b.value;
  b.value = tmp;
}

function clearAll(){
  document.getElementById("t1").value = "";
  document.getElementById("t2").value = "";
  document.getElementById("t3").value = "";
  document.getElementById("pair").value = "";
}


