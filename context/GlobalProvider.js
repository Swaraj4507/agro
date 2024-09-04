import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";

import { db } from "../lib/fire";
import AsyncStorage from "@react-native-async-storage/async-storage";



const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);
const cropsList = ["Apple", "Banana", "Beans", "Beetroot", "Betel", "Bhendi", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Chilli", "Citrus", "Coconut", "Coffee", "Cucumber", "Garlic", "Gourds", "Grapes", "Guava", "Mango", "Mulberry", "Muskmelon", "OilPalm", "Onion", "Papaya", "Pomegranate", "Potato", "Radish", "Rose", "Sapota", "Satawar", "Squash", "Tea", "Tomato", "Turnip", "Watermelon"];
const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [posts, setPosts] = useState([]);
  const [diseasesData, setDiseasesData] = useState({});
  const [diseasesLoading, setDiseasesLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  useEffect(() => {
    //check persistent user here
    const checkUserLogin = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log(parsedUser)
          setUser(parsedUser);
          setIsLogged(true);
          setUserType(parsedUser.role);
          const userDocRef = doc(db, "users", parsedUser.uid);
          const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const updatedUser = { ...parsedUser, ...doc.data() };
              // console.log("updated")
              // console.log(updatedUser)

              setUser(updatedUser);
              // setUserType(updatedUser.role);
              setIsVerified(updatedUser.verified);
              // console.log(userType);
              // Update AsyncStorage
              AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            }
          });
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching stored user data:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUserLogin();

  }, []);

  const fetchPosts = async () => {
    try {
      const postsSnapshot = await getDocs(collection(db, "posts"));
      const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // console.log(postsData)
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  const fetchDiseasesForCrop = async (cropName) => {

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
      // console.error("Error fetching data:", error);
      setDiseasesLoading(false);
    }
  };
  const storeUser = async (user) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsLogged(true);
      setUserType(user.role);
    } catch (error) {
      // console.error("Error storing user data:", error);
    }
  };
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      setIsLogged(false);
      setUserType("");
    } catch (error) {
      // console.error("Error logging out:", error);
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
        fetchDiseasesForCrop,
        storeUser,
        logout,
        posts,
        fetchPosts,
        isVerified
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
