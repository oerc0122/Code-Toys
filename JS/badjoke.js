
const places= [
    shop("butcher's shop","butcher","meat","steaks"),
    shop("jeweller's","jeweler","jewelery","gold rings"),
    shop("greengrocer's","grocer","fruit and veg","pears"),
    shop("optician's","optometrist","glasses","glasses"),
    shop("estate agent's","estate agent","houses","rentable houses"),
    shop("insurer's","actuary","insurance","insurance premiums statistics"),
    shop("apothecary","physician","herbal remedies","ginseng"),
    shop("pharmacy","pharmacist","medications","acetylsalicylic acid"),
    shop("cartographer's","cartographer","maps","maps"),
    shop("geology department","geologist","rocks","rocks"),
    shop("meteorology department","meteorologist","weather reports","weather forecasts"),
    shop("zoo","zookeeper","animals","lions"),
    shop("dig","archaeologist","flint and rocks and stuff","skeletons"),
    shop("aquarium","marine biologist","fish","sharks"),
    shop("dentist's office","receiptionist","dentists","appointments"),
    shop("circus","clown","red noses","performances today"),
    shop("airport","pilot","all these aeroplanes","wings"),
    shop("ornithologist's","ornithologist","birds","parrots"),
    shop("pet shop","proprietor","animals for sale","ducks"),
    shop("bar","barman","booze","beer"),
    shop("hairdresser","barber","haircuts","ability to cut his hair"),
    shop("bookshop","clerk","books","book"),
    shop("antiques shop","shopkeeper","antiques","old clocks"),
    shop("beauty salon","make-up artist","nail files","cuticle pushers"),
    shop("boutique","person on the counter","clothes","stylish jackets"),
    shop("builder's merchant","builder","building supplies","cement"),
    shop("chip shop","frier","fish and chips","battered sausage"),
    shop("delicatessen","owner","meat and sides","pepperoni"),
    shop("curtain shop","owner","curtains","blue velvet curtains"),
    shop("petrol station","pump attendant","petrol","diesel")
];



function shop(name,job,general_item,item) {
    return {"name":name,"job":job,"gen":general_item,"item":item}
}

function main(){


    out = document.getElementById('joke');
    nplaces = places.length;
    var inside = places[Math.floor(Math.random()*nplaces)];
    var want = places[Math.floor(Math.random()*nplaces)];

    out.innerHTML="A moth walks into a "+inside.name+" and asks the "+inside.job+" if they have any "+want.item+". "
    if (inside.name == want.name) {
	out.innerHTML += "The moth pays and leaves a happy customer."
    } else {
	out.innerHTML += "<br> The "+inside.job+" says \"I'm sorry, this is a "+inside.name+". We don't do "+want.item+", we only have "+inside.gen+".\" <br> The moth says \"I know.\" <br> The "+inside.job+" says \"So why'd you come in?\" <br> The moth says \"The light was on.\""
    }
    
}

