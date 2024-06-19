import React from "react";
import { View, Button } from "react-native";
import { db } from "../../lib/fire";
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

const UploadScreen = () => {
  const jsonData = {
    Mango: {
      diseases: [
        {
          name: "Anthracnose",
          img: "https://apps.lucidcentral.org/pppw_v10/images/entities/mango_anthracnose_009/fruitrots.jpg",
          solution: [
            {
              chemical_name: "P. fluorescens (FP 7)",
              how_to_use_it:
                "Spray at 3 weeks interval commencing from October at 5g/l on flower branches. 5-7 sprays, one to be given on flowers and bunches.",
            },
            {
              chemical_name: "Hot water treatment",
              how_to_use_it:
                "Treat with hot water (50-55°C) for 15 minutes before storage.",
            },
            {
              chemical_name: "Benomyl solution",
              how_to_use_it:
                "Dip in Benomyl solution (500ppm) for 5 minutes before storage.",
            },
            {
              chemical_name: "Thiobendazole solution",
              how_to_use_it:
                "Dip in Thiobendazole solution (1000ppm) for 5 minutes before storage.",
            },
          ],
        },
        {
          name: "Powdery mildew",
          img: "https://www.greenlife.co.ke/wp-content/uploads/2022/04/mango_powdery_mildew.jpg",
          solution: [
            {
              chemical_name: "Fine sulphur",
              how_to_use_it:
                "Dust with fine sulphur (250-300 mesh) at the rate of 0.5 kg/tree. First application soon after flowering, second 15 days later.",
            },
            {
              chemical_name: "Wettable sulphur",
              how_to_use_it: "Spray with 0.2% Wettable sulphur.",
            },
            {
              chemical_name: "Carbendazim",
              how_to_use_it: "Spray with 0.1% Carbendazim.",
            },
            {
              chemical_name: "Tridemorph",
              how_to_use_it: "Spray with 0.1% Tridemorph.",
            },
            {
              chemical_name: "Karathane",
              how_to_use_it: "Spray with 0.1% Karathane.",
            },
          ],
        },
        {
          name: "Mango malformation",
          img: "https://agritech.tnau.ac.in/crop_protection/images/mango/manomalformation/mango_malformation2.jpg",
          solution: [
            {
              chemical_name: "NAA (Naphthaleneacetic acid)",
              how_to_use_it: "Spray with 100-200ppm NAA during October.",
            },
            {
              chemical_name: "Carbendazim",
              how_to_use_it:
                "Prune diseased parts, then spray with 0.1% Carbendazim or Captafol (0.2%).",
            },
          ],
        },
        {
          name: "Stem end rot",
          img: "https://agritech.tnau.ac.in/crop_protection/images/posthar_mango/2.Mango%20stem%20end%20rot2.JPG",
          solution: [
            {
              chemical_name: "Carbendazim",
              how_to_use_it:
                "Prune and destroy infected twigs, then spray with 0.1% Carbendazim or Thiophanate Methyl (0.1%) or Chlorathalonil (0.2%) at fortnightly intervals during rainy season.",
            },
          ],
        },
        {
          name: "Red-rust",
          img: "https://www.researchgate.net/publication/327224274/figure/fig6/AS:663492650614795@1535200383458/Red-Rust-Cephaleuros-virescens-an-algal-plant-pathogen-affected-leaf.png",
          solution: [
            {
              chemical_name: "Bordeaux mixture",
              how_to_use_it: "Spray with 0.6% Bordeaux mixture.",
            },
            {
              chemical_name: "Copper oxychloride",
              how_to_use_it: "Spray with 0.25% Copper oxychloride.",
            },
          ],
        },
        {
          name: "Grey Blight",
          img: "https://agritech.tnau.ac.in/crop_protection/images/mango_grey_blight.jpg",
          solution: [
            {
              chemical_name: "Copper oxychloride",
              how_to_use_it:
                "Spray with 0.25% Copper oxychloride or 0.25% Mancozeb or 1.0% Bordeaux mixture.",
            },
          ],
        },
        {
          name: "Sooty mould",
          img: "https://agritech.tnau.ac.in/crop_protection/images/mango/sootymould/crop_prot_crop%20diseases_fruits_mango_clip_image030_0000.jpg",
          solution: [
            {
              chemical_name: "Systemic insecticides",
              how_to_use_it:
                "Control insects by spraying systemic insecticides like Monocrotophos or Methyl dematon, then spray starch solution (1kg Starch/Maida in 5 litres of water. Boil and dilute to 20 liters).",
            },
          ],
        },
      ],
    },
    Banana: {
      diseases: [
        {
          name: "Panama disease",
          img: "https://agritech.tnau.ac.in/crop_protection/images/banana_diseases/7.1.jpg",
          solution: [
            {
              chemical_name: "Carbofuran granules",
              how_to_use_it: "Pairing and prolinage",
            },
            {
              chemical_name: "Carbendezim",
              how_to_use_it: "Corm injection of 3 ml of 2% solution",
            },
          ],
        },
        {
          name: "Moko disease",
          img: "https://apps.lucidcentral.org/pppw_v11/images/entities/banana_moko_disease_525/moko_on_bluggoe_regime_st_patrick_grenada_2007_e__wicker_cirad.jpg",
          solution: [
            {
              chemical_name: "Not specified",
              how_to_use_it:
                "Eradicate infected plant, Expose soil to direct sunlight, Use clean planting material, Fallowing and crop rotation, Disinfection of pruning tools, Provide good drainage",
            },
          ],
        },
        {
          name: "Tip over or Heart rot",
          img: "https://content.peat-cloud.com/w400/bacterial-soft-rot-of-banana-banana-1563276438.jpg",
          solution: [
            {
              chemical_name: "Methoxy ethyl mercuric chloride (Emisan-6)",
              how_to_use_it: "Drench with 0.1% solution",
            },
            {
              chemical_name: "Sodium hypohlorite",
              how_to_use_it: "Drench with 10% solution",
            },
            {
              chemical_name: "Bleaching powder",
              how_to_use_it: "Drench with 20g/litre solution",
            },
          ],
        },
        {
          name: "Sigatoka disease",
          img: "https://agritech.tnau.ac.in/crop_protection/images/banana_diseases/8.2.jpg",
          solution: [
            {
              chemical_name: "Propiconazole",
              how_to_use_it: "Spray with 0.1% solution",
            },
            {
              chemical_name: "Carbendazim",
              how_to_use_it: "Spray with 0.1% solution",
            },
            {
              chemical_name: "Chlorothalonil",
              how_to_use_it: "Spray with 0.25% solution",
            },
          ],
        },
        {
          name: "Cigar end Rot",
          img: "https://agritech.tnau.ac.in/crop_protection/images/banana_diseases/4.2.jpg",
          solution: [
            {
              chemical_name: "Dithane M -45",
              how_to_use_it: "Spray with 0.1% solution",
            },
            {
              chemical_name: "Topsin M",
              how_to_use_it: "Spray with 0.1% solution",
            },
          ],
        },
        {
          name: "Anthracnose",
          img: "https://agritech.tnau.ac.in/crop_protection/images/post_harvest_dis/banana/1_anthracnose1.jpg",
          solution: [
            {
              chemical_name: "Carbendazim",
              how_to_use_it: "Post-harvest dipping with 400 ppm solution",
            },
            {
              chemical_name: "Benomyl",
              how_to_use_it: "Post-harvest dipping with 1000 ppm solution",
            },
            {
              chemical_name: "Aureofunginsol",
              how_to_use_it: "Post-harvest dipping with 100 ppm solution",
            },
          ],
        },
        {
          name: "Freckle or Black Spot",
          img: "https://www.dpi.nsw.gov.au/__data/assets/image/0019/800047/BananaFreckle3.jpg",
          solution: [
            {
              chemical_name: "Copper oxychloride",
              how_to_use_it: "Spray with 0.25% solution",
            },
          ],
        },
        {
          name: "Banana bunchy top",
          img: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Banana_Bunch_Top_Virus.jpg",
          solution: [
            {
              chemical_name: "Methyl demoton",
              how_to_use_it: "Spray with 1 ml/l solution",
            },
            {
              chemical_name: "Monocrotophos",
              how_to_use_it: "Spray with 2 ml/l solution",
            },
            {
              chemical_name: "Phosphomidon",
              how_to_use_it: "Spray with 1 ml/l solution",
            },
            {
              chemical_name: "2, 4, D",
              how_to_use_it:
                "Destroy infected plants using 4ml of 2, 4, D (50g in 400 ml of water)",
            },
          ],
        },
        {
          name: "Infectious chlorosis",
          img: "https://agritech.tnau.ac.in/crop_protection/images/banana_diseases/6.1.jpg",
          solution: [
            {
              chemical_name: "Not specified",
              how_to_use_it:
                "Destroy infected plants, Use disease-free suckers, Control vector by spraying systemic insecticide with 0.1% solution",
            },
          ],
        },
      ],
    },
  };

  const uploadDataToFirebase = async () => {
    console.log("Initiated");
    try {
      // Iterate over each crop
      for (const crop in jsonData) {
        // Create a new document reference for each crop in the "diseases" collection
        const cropDocRef = doc(db, "diseases", crop);

        // Ensure the crop document exists
        await setDoc(cropDocRef, { name: crop }, { merge: true });

        // Iterate over each disease of the current crop
        for (const disease of jsonData[crop].diseases) {
          // Create a new document for each disease under the crop's "Diseases" subcollection
          const diseaseDocRef = doc(cropDocRef, "Diseases", disease.name);

          // Add the disease document
          await setDoc(diseaseDocRef, { name: disease.name }, { merge: true });

          // Create a subcollection "Solutions" for each disease document
          const solutionsRef = collection(diseaseDocRef, "Solutions");

          // Add solutions as documents in the "Solutions" subcollection
          for (const solution of disease.solution) {
            await addDoc(solutionsRef, {
              chemical_name: solution.chemical_name,
              how_to_use_it: solution.how_to_use_it,
            });
          }

          console.log(`Disease "${disease.name}" uploaded successfully!`);
        }
      }

      console.log("All data uploaded successfully!");
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };

  const fetchDataFromFirebase = async () => {
    console.log("fetching");
    try {
      const diseasesSnapshot = await getDocs(collection(db, "diseases"));
      const data = {};

      for (const cropDoc of diseasesSnapshot.docs) {
        const cropName = cropDoc.id;
        const diseasesSnapshot = await getDocs(
          collection(cropDoc.ref, "Diseases")
        );
        const diseases = [];

        for (const diseaseDoc of diseasesSnapshot.docs) {
          const diseaseName = diseaseDoc.id;
          const solutionsSnapshot = await getDocs(
            collection(diseaseDoc.ref, "Solutions")
          );
          const solutions = [];

          for (const solutionDoc of solutionsSnapshot.docs) {
            solutions.push(solutionDoc.data());
          }

          diseases.push({ name: diseaseName, solution: solutions });
        }

        data[cropName] = { diseases };
      }

      console.log(data);
      // console.log(data[0].diseases);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const test = () => {
    console.log();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Upload Data" onPress={uploadDataToFirebase} />
      <Button title="Fetch Data" onPress={fetchDataFromFirebase} />
    </View>
  );
};

export default UploadScreen;
