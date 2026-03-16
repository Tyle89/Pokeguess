const TOTAL = 1025;

const grid = document.getElementById("pokedexGrid");

const input = document.getElementById("pokemonInput");

const message = document.getElementById("message");
const hintText = document.getElementById("hint");

const foundSpan = document.getElementById("found");

const progressBar = document.getElementById("progressBar");

const regionsContainer = document.getElementById("regions");
const achievementsContainer = document.getElementById("achievements");

const evolutionDiv = document.getElementById("evolution");

let pokemonList=[];

let foundPokemon=JSON.parse(localStorage.getItem("foundPokemon")) || [];

const regions=[

{name:"Kanto",start:1,end:151},
{name:"Johto",start:152,end:251},
{name:"Hoenn",start:252,end:386},
{name:"Sinnoh",start:387,end:493},
{name:"Unova",start:494,end:649},
{name:"Kalos",start:650,end:721},
{name:"Alola",start:722,end:809},
{name:"Galar",start:810,end:905},
{name:"Paldea",start:906,end:1025}

];

async function loadPokemon(){

pokemonList = [];

for(let i = 1; i <= 1025; i++){

const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}`);
const data = await res.json();

const frenchName = data.names.find(n => n.language.name === "fr").name;

pokemonList.push({
id:i,
name:frenchName.toLowerCase()
});

}

drawGrid();
updateStats();

}

function drawGrid(){

grid.innerHTML="";

pokemonList.forEach(p=>{

const div=document.createElement("div");

div.classList.add("pokemon");

const img=document.createElement("img");

img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

if(!foundPokemon.includes(p.name)){
img.classList.add("silhouette");
}

div.appendChild(img);

const num=document.createElement("div");

num.textContent="#"+p.id;

div.appendChild(num);

grid.appendChild(div);

});

}

document.getElementById("guessBtn").addEventListener("click",async ()=>{

const guess=input.value.toLowerCase().trim();

const pokemon=pokemonList.find(p=>p.name===guess);

if(!pokemon){

message.textContent="Ce Pokémon n'existe pas";
return;

}

if(foundPokemon.includes(guess)){

message.textContent="Déjà trouvé";
return;

}

foundPokemon.push(guess);

localStorage.setItem("foundPokemon",JSON.stringify(foundPokemon));

message.textContent="Pokémon trouvé !";

playCry(pokemon.id);

showEvolution(pokemon.id);

drawGrid();

updateStats();

input.value="";

});

function updateStats(){

foundSpan.textContent=foundPokemon.length;

let percent=(foundPokemon.length/TOTAL)*100;

progressBar.style.width=percent+"%";

updateRegions();

updateAchievements();

}

function updateRegions(){

regionsContainer.innerHTML="";

regions.forEach(region=>{

let total=region.end-region.start+1;

let found=pokemonList.filter(p=>

p.id>=region.start &&
p.id<=region.end &&
foundPokemon.includes(p.name)

).length;

const div=document.createElement("div");

div.classList.add("region");

div.textContent=`${region.name} : ${found} / ${total}`;

regionsContainer.appendChild(div);

if(found===total){

addAchievement(region.name+" complété !");

}

});

}

function updateAchievements(){

achievementsContainer.innerHTML="";

if(foundPokemon.length>=10)addAchievement("10 Pokémon trouvés");

if(foundPokemon.length>=50)addAchievement("50 Pokémon trouvés");

if(foundPokemon.length>=100)addAchievement("100 Pokémon trouvés");

if(foundPokemon.length>=500)addAchievement("500 Pokémon trouvés");

if(foundPokemon.length===1025)addAchievement("Pokédex complété");

}

function addAchievement(text){

const div=document.createElement("div");

div.classList.add("achievement");

div.textContent="🏆 "+text;

achievementsContainer.appendChild(div);

}

document.getElementById("hintBtn").addEventListener("click",async ()=>{

const remaining=pokemonList.filter(p=>!foundPokemon.includes(p.name));

const random=remaining[Math.floor(Math.random()*remaining.length)];

const data=await fetch(`https://pokeapi.co/api/v2/pokemon/${random.name}`).then(r=>r.json());

const type=data.types.map(t=>t.type.name).join(", ");

let regionName=regions.find(r=>random.id>=r.start && random.id<=r.end).name;

hintText.textContent=`Indice : Région ${regionName} | Type ${type} | Lettre ${random.name.charAt(0).toUpperCase()}`;

});

function playCry(id){

let audio=new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);

audio.play();

}

async function showEvolution(id){

evolutionDiv.innerHTML="";

const species=await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(r=>r.json());

const evoData=await fetch(species.evolution_chain.url).then(r=>r.json());

let chain=[];

let current=evoData.chain;

while(current){

chain.push(current.species.name);

current=current.evolves_to[0];

}

chain.forEach(name=>{

const pokemon=pokemonList.find(p=>p.name===name);

const div=document.createElement("div");

div.classList.add("evo");

div.innerHTML=`

<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png">
<span>${name}</span>

`;

evolutionDiv.appendChild(div);

});

}

loadPokemon();