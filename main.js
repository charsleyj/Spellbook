
function getJSONData() {

    // TEMP Change to allow for the webpage to be ran locally without a server
    spells = resource_spells;
    generateTable();

    // $.getJSON("resource/spells.json", function(data) {
    //     spells = data;
    //     generateTable();
    // });
}

function sl(n) {
    if(!n instanceof String) {
        n = n.toString();
    }
    return n.replaceAll(" ", "-").replaceAll("'", "").replaceAll("\\(", "").replaceAll("\\)", "").replaceAll("/", "");
}



// Filter Functions

function hide(id) {
    $("#full-"+id).toggle();
    var e = $("#"+id);
    e.html(e.html()=="Show" ? "Hide" : "Show");
}

function noHide(element) {
    return true;
}

var filters = {
    "default": noHide
};

function isShown(element) {
    for (var filter in filters) {
        if (!filters[filter](element)) return false;
    }
    return true;
}

function setFilter(filter, func) {
    console.log(filter);
    filters[filter] = func;
    generateTable();
}

function setSort(s) {
    if (sort==s) reverse = !reverse;
    sort = s;
    generateTable();
}



// Spells Functions

function addSpell(s) {
    var spellbook = [];
    if (!hasData(CURRENT_DATA)) spellbook = [];
    else spellbook = loadData(CURRENT_DATA);
    if (hasSpell(s)) spellbook.splice(spellbook.indexOf(s), 1);
    else spellbook.push(s);
    saveData(CURRENT_DATA, spellbook);
}

function hasSpell(s) {
    if (!hasData(CURRENT_DATA)) return false;
    var spellbook = loadData(CURRENT_DATA);
    return spellbook.indexOf(s)!=-1;
}

function getSpells() {
    var spellbook = [];
    if (hasData(CURRENT_DATA)) spellbook = loadData(CURRENT_DATA);
    return spellbook;
}

function clearSpells() {
    if (confirm("Are you sure you want to clear the current spellbook?")) {
        saveData(CURRENT_DATA, []);
        location.reload();
    }
}



// View Functions

function changeView(s) {
    if (view=="spells") {
        view = "spellbooks";
        $("#changeView"+s).html("View Spell List");
        $("#sorters").hide();
        generateSpellbooks();
    } else {
        view = "spells";
        $("#changeView"+s).html("View Spellbook Library");
        $("#sorters").show();
        generateTable();
    }
}

function saveSpellbook(name) {
    var spellbooks = getSpellbooks();
    var sb = getSpells();
    var contains = false;
    for (var i = 0; i<spellbooks.length; i++) {
        var s = spellbooks[i];
        if (s[0]==name) {
            s[1] = sb;
            contains = true;
        }
    }
    if (!contains) {
        var a = [];
        a.push(name);
        a.push(sb);
        spellbooks.push(a);
    }
    saveData(SPELLBOOKS_DATA, spellbooks);
    generateSpellbooks();
}

function getSpellbooks() {
    var spellbooks = {};
    if (!hasData(SPELLBOOKS_DATA)) spellbooks = [];
    else spellbooks = loadData(SPELLBOOKS_DATA);
    return spellbooks;
}

function deleteSpellbook(name) {
    var spellbooks = getSpellbooks();
    if (!confirm("Are you sure you want to delete spellbook \""+name+"\"?")) return;
    for (var i = 0; i<spellbooks.length; i++) {
        var sb = spellbooks[i];
        if (sb[0]==name) spellbooks.remove(i);
    }
    saveData(SPELLBOOKS_DATA, spellbooks);
    generateSpellbooks();
}

function saveCurrentBook() {
    var name = prompt("Choose a name for the spellbook.", "My Spellbook");
    if (name==null || name.length==0) return;
    saveSpellbook(name);
}

function loadSpellbook(name) {
    if (!confirm("Are you sure you want to load spellbook \""+name+"\"? This will clear the current spellbook.")) return;
    var spellbooks = getSpellbooks();
    for (var i = 0; i<spellbooks.length; i++) {
        if (spellbooks[i][0]==name) {
            saveData(CURRENT_DATA, spellbooks[i][1]);
            generateSpellbooks();
            return;
        }
    }
}

function generateSpellbooks() {
    var spellList = getSpells();
    var ans = "";
    var spellbooks = getSpellbooks();

    ans+="<div class='container'>";

    ans+="<div class='card' style='text-align: center'><button type='button' class='btn' onclick='saveCurrentBook();'>Save Spellbook As...</button> <button type='button' class='btn' onclick='clearSpells();'>Clear Spells</button><h1 class='sb-name'>Current Spellbook</h1>";
    ans+=generateSpellNames(spellList)+"</div>";

    for (var i = 0; i<spellbooks.length; i++) {
        var sb = spellbooks[i];
        ans+="<div class='card' style='text-align: center'><button type='button' class='btn' onclick='deleteSpellbook(\""+sb[0]+"\");'>Delete Spellbook</button> <button type='button' class='btn' onclick='loadSpellbook(\""+sb[0]+"\");'>Load Spellbook</button><h1 class='sb-name'>"+sb[0]+"</h1>";
        ans+=generateSpellNames(sb[1])+"</div>";
    }

    ans+="</div><div class='col-lg-2'></div>";

    $(".table").html(ans);
    $("#sort1").hide();
    $("#sort2").hide();
    $("#sort3").hide();
}

function generateSpellNames(spellbook) {
    if (spellbook.length==0) return "<div style='text-align: center; font-size: 1.2em; font-weight: bold; font-style: italic'>No spells!</div>";
    var ans = "<ul class='list-group' style='margin: auto; text-align: center;'>";
    for (var i = 0; i<spellbook.length; i++) {
        ans+="<li class='list-group-item' style='font-size: 1.2em; font-weight: bold; font-style: italic;'>"+spellbook[i]+"</li>";
    }
    ans+="</ul>";
    return ans;
}

function generateTable() {
    //sort based on sort variable and filter out those not allowed by isShown
    var sortable=[];
    for (var key in spells) if (spells.hasOwnProperty(key) && isShown(spells[key])) sortable.push([key, spells[key]]);
    sortable.sort(function(a, b) {
        return (reverse ? -1 : 1) * (a[1][sort] < b[1][sort] ? -1 : a[1][sort] > b[1][sort] ? 1 : 0); //if reverse is true, sort in the opposite direction.
    });

    var ans = "<table class='table'><thead class='thead-inverse'><tr><th>Full</th><th class='sort' onclick='setSort(\"name\");'>Name</th><th class='sort' onclick='setSort(\"level\");'>Level</th><th class='sort' onclick='setSort(\"school\");'>School</th><th class='sort' onclick='setSort(\"classes\");'>Classes</th><th>Spellbook</th></tr></thead>";

    for (var i = 0; i<sortable.length; i++)  {
        var arr = sortable[i];
        var name = arr[0];
        var spell = arr[1];
        ans+="<tr>";
        ans+="<td><button type='button' data-toggle='collapse' href='#full-"+sl(name)+"' class='btn' onclick='hide(\""+sl(name)+"\");' id=\""+sl(name)+"\" >Show</button></td>";
        //ans+="<td><a href='#' data-activates='full-"+sl(name)+"' class='button-collapse'>test</a></td>";
        ans+="<td data-toggle='tooltip' data-placement='right' title='"+(spell["description"].length>399 ? spell["description"].substr(0,400)+"..." : spell["description"])+"'>"+name+"</td>";
        ans+="<td>"+(spell["level"]==0 ? "Cantrip" : spell["level"])+"</td>";
        ans+="<td>"+spell["school"]+"</td>";
        ans+="<td>"+spell["classes"].toString().replaceAll(",", ", ")+"</td>";
        ans+="<td style='text-align: center;'><button type='button' class='btn'  id='b-"+sl(name)+"' onclick='var r = \"Remove\"; var a = \"Add\"; addSpell(\""+name+"\"); $(\"#b-"+sl(name)+"\").html((hasSpell(\""+name+"\") ? r : a))'>"+(hasSpell(name) ? "Remove" : "Add")+"</button>";
        ans+="</tr>";

        ans+="<tr id=\"full-"+sl(name)+"\" class='collapse' style='display:none;'><td colspan='100%' style='width:1em;' class='row'><blockquote><div class='col l8'>";

        ans+="<b>Components: </b>"+spell["components"]+"<br/>";
        ans+="<b>Duration:</b> "+spell["duration"]+"<br/>";
        ans+="<b>Casting Time: </b>"+spell["casting_time"]+"<br/>";
        ans+="<b>Range: </b>"+spell["range"]+"<br/>";
        ans+="<b>Description:</b><br/>"+spell["description"]+"<br/>";
        ans+="<b>At Higher Levels:</b><br/>"+(spell["athigherlevel"].length<2 ? "No change." : spell["athigherlevel"])+"<br/>";
        ans+="<em style='font-size: .75em;'>Source: "+spell["source"]+", page "+spell["page"]+"</em><br/>";

        ans+="</div></blockquote></td></tr>";
        $("#sort1").show();
        $("#sort2").show();
        $("#sort3").show();
    }

    ans+="</table>";
    $(".table").html(ans);
    $(".button-collapse")
}



// Stored Data Functions
// TEMP Changed from cookies to localStorage to allow the webpage to be ran locally without a server

function hasData(name){
    return localStorage.getItem(name) !== null;
    //return $.cookie(name) !== undefined;
}

function loadData(name) {
    return JSON.parse(localStorage.getItem(name));
    //return JSON.parse($.cookie(name));
}

function saveData(name, data){
    localStorage.setItem(name, JSON.stringify(data));
    //$.cookie(name, JSON.stringify(data), {expires: 2147483647, path: '/'});
}



// Main Function

const CURRENT_DATA = "spellbook";
const SPELLBOOKS_DATA = "spellbooks";

$('select').material_select();
$(".button-collapse").sideNav();

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var spells = {};
var sort = "name";
var reverse = false;
var view = "spells";

getJSONData();
