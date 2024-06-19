import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getCurrentUser } from "../lib/appwrite";
import { db } from "../lib/fire";
const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);
const cropsList = ["Apple", "Banana", "Beans", "Beetroot", "Betel", "Bhendi", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Chilli", "Citrus", "Coconut", "Coffee", "Cucumber", "Garlic", "Gourds", "Grapes", "Guava", "Mango", "Mulberry", "Muskmelon", "OilPalm", "Onion", "Papaya", "Pomegranate", "Potato", "Radish", "Rose", "Sapota", "Satawar", "Squash", "Tea", "Tomato", "Turnip", "Watermelon"];
const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");

  const [diseasesData, setDiseasesData] = useState({});
  const [diseasesLoading, setDiseasesLoading] = useState(true);
  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });

    // const fetchDiseases = async () => {
    //   try {
    //     const diseasesSnapshot = await getDocs(collection(db, "diseases"));
    //     const data = {};

    //     for (const cropDoc of diseasesSnapshot.docs) {
    //       const cropName = cropDoc.id;
    //       const cropDiseasesSnapshot = await getDocs(collection(db, "diseases", cropName, "Diseases"));
    //       const cropDiseases = [];

    //       for (const diseaseDoc of cropDiseasesSnapshot.docs) {
    //         const diseaseName = diseaseDoc.id;
    //         const diseaseData = diseaseDoc.data();
    //         const solutionsSnapshot = await getDocs(collection(diseaseDoc.ref, "Solutions"));
    //         const solutions = solutionsSnapshot.docs.map(doc => doc.data());

    //         cropDiseases.push({ name: diseaseName, img: diseaseData.img, solutions });
    //       }

    //       data[cropName] = cropDiseases;
    //     }

    //     setDiseasesData(data);
    //     setDiseasesLoading(false);
    //     console.log("fetching from db complete for diseases")
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //     setDiseasesLoading(false);
    //   }
    // };

    // fetchDiseases();
  }, []);
  const fetchDiseasesForCrop = async (cropName) => {
    console.log(cropName)
    setDiseasesLoading(true);
    try {
      const cropDiseasesSnapshot = await getDocs(collection(db, "diseases", cropName, "Diseases"));
      const cropDiseases = [];

      for (const diseaseDoc of cropDiseasesSnapshot.docs) {
        const diseaseName = diseaseDoc.id;
        const diseaseData = diseaseDoc.data();
        const solutionsSnapshot = await getDocs(collection(diseaseDoc.ref, "Solutions"));
        const solutions = solutionsSnapshot.docs.map(doc => doc.data());

        cropDiseases.push({ name: diseaseName, img: diseaseData.img, solutions });
      }

      setDiseasesData(prevData => ({
        ...prevData,
        [cropName]: cropDiseases,
      }));
      setDiseasesLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setDiseasesLoading(false);
    }
  };
  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        userType, setUserType,
        loading,
        cropsList,
        diseasesData,
        diseasesLoading,
        fetchDiseasesForCrop
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
