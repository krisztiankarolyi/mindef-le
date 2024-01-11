/*
1.	Mely gyártók készítenek legalább 2 fajta termékből legalább 2-t. (pl. A gyártó gyárt legalább 2 pc-t és legalább 2 laptopot) 
- eredmény: (A,D,E)

2.	Adjuk meg minden gyártó és sebességre az átlagárat (sebesség csak pc vagy laptopban van).
gyarto	sebesseg	atlagar	
A		1.42		 478	
A		2.10		 995	
A		2.66		2114

3.	Adjuk meg a ‘B’ gyártó által gyártott azon számítógépek (pc+laptop) maximális sebességét, amelyek memóriája nagyobb, mint 512.

4.	Melyik gyártók gyártanak pc-ket és laptopokat, de tableteket nem.

5.	Mely gyártók gyártanak az átlag pc memóriánál kisebb memóriájú pc-ket?

6.	Mely pc-ket nem szervizel senki? (modell)

7.	Mely szervizelőhöz milyen átlagsebesség tartozik (pc vagy laptop) ? (csaladnev,atlagseb)

8.	Mely szervizelő párok szervizelik ugyanazokat a gépeket, s melyek azok a gépek? (csaladnev1,csaladnev2,modell)

9.	Adjuk meg azon gyártók halmazát, akiknek van legalább egy gépük, amelyet nem szervizel senki. (gyarto)
*/

use karolyikrisztian;
show collections;

db.termek3.findOne();

//1
db.termek3.aggregate([
    {
        $group: {
            _id: { gyarto: "$gyarto", termektipus: "$termektipus" },
            count: { $sum: 1 }
        }
    },
    {
        $match: {
            count: { $gte: 2 }
        }
    },
    {
        $group: {
            _id: "$_id.gyarto",
            termektipusok: { $addToSet: "$_id.termektipus" },
            totalTypes: { $sum: 1 }
        }
    },
    {
        $match: {
            totalTypes: { $gte: 2 }
        }
    },
    {
        $project: {
            _id: 1
        }
    }
]);



//2
db.termek3.aggregate([
    {
        $match: { "termektipus": { $in: ["pc", "laptop"] } }
    },
    {
        $group: {
            _id: {
                gyarto: "$gyarto",
                sebesseg: "$sebesseg"
            },
            atlagAr: { $avg: "$ar" }
        }
    },
    
    {
        $sort: {"_id": 1}
    }
]);


//3
db.termek3.aggregate([
    {
        $match: 
        {
            gyarto: "B",
            termektipus: {$in: ["pc", "laptop"]}, 
            memoria: {$gt: 512}
            
        }
    },
    {
        $group: 
        {
            _id: "$gyarto", 
            maxSeb: {$max: "$sebesseg"}
            
        }
    }
]);



//4.	Melyik gyártók gyártanak pc-ket és laptopokat, de tableteket nem.
var nemlehetbenne = "tablet"
db.termek3.aggregate([
    {
         $group:
         {
            _id: "$gyarto",
            termekTipusok: {$addToSet: "$termektipus"}
         }
    },
    {
        $match: {"termekTipusok": {$all: ["pc", "laptop"], $nin: ["$nemlehetbenne"]}}
    }
   
]);



//5.	Mely gyártók gyártanak az átlag pc memóriánál kisebb memóriájú pc-ket?
var avgPcMem = 0.0;

// Calculate the average PC memory
var avgPcMemResult = db.termek3.aggregate([
    {
        $match: { termektipus: "pc" }
    },
    {
        $group: {
            _id: 1,
            avgPCmem: { $avg: "$memoria" }
        }
    }
]);

// Iterate over the result cursor
avgPcMemResult.forEach(function(doc) {
    avgPcMem = doc.avgPCmem;
});

// Find manufacturers with PCs having memory sizes less than the average
var manufacturersBelowAvg = db.termek3.aggregate([
    {
        $match: {
            termektipus: "pc",
            memoria: { $lt: avgPcMem }
        }
    },
    {
        $group: {
            _id: "$gyarto"
        }
    }
]);

// Iterate over the result cursor and print the manufacturers
manufacturersBelowAvg.forEach(function(doc) {
    print(doc._id);
});



//6.	Mely pc-ket nem szervizel senki? (modell)
db.termek3.aggregate([
    {
        $match: {
            termektipus: "pc",
            $or: [
                { szervizelok: { $eq: [] } },
                { szervizelok: { $exists: false } }
            ]
        }
    },
    {
        $project: {_id: 1}
    }
]);



//7.	Mely szervizelőhöz milyen átlagsebesség tartozik (pc vagy laptop) ? (csaladnev,atlagseb)
db.termek3.aggregate([
    {
       $match: { "termektipus": { $in: ["pc", "laptop"] } }  
    },
    {
        $unwind: "$szervizelok"
    },
    {
        $group: { _id: "$szervizelok", atlagSebesseg: {$avg: "$sebesseg"}}
    }
]);




//8 Mely szervizelő párok szervizelik ugyanazokat a gépeket, s melyek azok a gépek? (csaladnev1,csaladnev2,modell)
db.termek3.aggregate([
	{
		$project:{szervizelok:1,_id:1}
	},
	{
		$match:{"szervizelok.1":{$exists:true}}
	}
]);



//9.	Adjuk meg azon gyártók halmazát, akiknek van legalább egy gépük, amelyet nem szervizel senki. (gyarto)
db.termek3.aggregate([
    {
        $match: { "termektipus": { $in: ["pc", "laptop"] }, "szervizelok": {$exists: false} }
    },

    {
        $group: {_id: "$gyarto", SzervizeletlenTermekekDb: {$sum: 1}}
    }
]);



