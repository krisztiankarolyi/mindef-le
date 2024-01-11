/*
    1Ki gyártja a 3004-es modellt?
    2 Melyek azok a számítógépek (pc+laptop) amelyek sebessége kisebb, mint 1.6?
    3 Melyik gyártó gyárt legfeljebb száz gigabájt méretű merevlemezzel rendelkező laptopot?
    4 Hány elemű a termék tábla?
    5 Kik gyártanak legfeljebb 1 gigabájt memóriájú számítógépet (pc+laptop)?
    6 Adjuk meg minden gyártóhoz a minimális árat.
    7 Hány különböző modellünk van a pc táblában?
    8 Adjuk meg a H gyártó által gyártott számítógépek (pc+laptop) modellszámát és sebességét.
    9 Kik gyártanak pc-t és laptopot, de nyomtatót nem? */
    
use karolyikrisztian;

//1
db.termek3.find({_id: "3004"}, {gyarto: 1, _id: 0});

//2
db.termek3.find(
    {
        termektipus: {$in: ["pc", "laptop"]},
        sebesseg: {$lt: 1.6}
    },

    
);

//3
db.termek3.aggregate([
    {
        $match: 
        {
            $and: [
                {"termektipus": "laptop"},
                {"merevlemez": {$lte: 100}}
            ]
        }
        
    }, 
    //egy tömbben visszaadva
    {
      $group: {_id: "gyartoklista", gyartok: {$addToSet: "$gyarto"}  }
    }
/* külön dokumentumokban visszaadva
    ,
    {
      $group: {_id: "$gyarto"}  }
    } 
*/
]);


//4
db.termek.countDocuments();
// vagy 
db.termek.aggregate([
    {
         $group: { _id: "tablaMeret", db: {$sum: 1} }
    },
    {
        $project: {_id: 0}
    }
]);


//5
db.termek3.aggregate([
    {
        $match: 
        {
          "termektipus": {$in: ["pc", "laptop"]}
        }
        
    }, 
    {
        $match: 
        {
          "memoria": {$lte: 1024}
        }
        
    }, 
    //egy tömbben visszaadva
    {
      $group: {_id: "gyartoklista", gyartok: {$addToSet: "$gyarto"}  }
    }
]);


//6
db.termek3.aggregate([
    {
         $group: { _id: "$gyarto", minAr: {$min: "$ar"} }
    },
    {
        $sort: {minAr: 1}
    }
]);




//7
db.termek3.aggregate([
    {
        $match: { "termektipus": "pc" }
    },
    {
        $group: { _id: 1, modellszam: { $addToSet: "$_id" } }
    },
    {
        $project: { "_id": 0, modellCount: { $size: "$modellszam" } }
    }
]);




//8
db.termek3.aggregate([
    {
        $match:  { "gyarto": "H", "termektipus": {$in: ["pc", "laptop"]}  }
    },
    {
        $project: {"_id": 1, "sebesseg": 1}
    }
        
]);



//9
db.termek3.aggregate([
    {
        $group: { _id: "$gyarto", termekek: { $addToSet: "$termektipus" } }
    },
    {
        $match: {
            termekek: {
                $all: ["pc", "laptop"],
                $nin: ["nyomtato"]
            }
        }
    }
]);




