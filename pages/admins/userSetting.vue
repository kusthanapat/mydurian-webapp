<script setup>
    import { ref, onMounted } from 'vue';
    import {
    initializeApp
    } from "firebase/app";
    import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc
    } from "firebase/firestore";

    // Firebase Configuration
    const firebaseConfig = {
    apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
    authDomain: "checklogin-67a92.firebaseapp.com",
    projectId: "checklogin-67a92",
    storageBucket: "checklogin-67a92.appspot.com",
    messagingSenderId: "246538906966",
    appId: "1:246538906966:web:2e4399caaa96210df23af7",
    measurementId: "G-X3068LRCWT",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    definePageMeta({
        layout: "defaultadmin"
    });

    // Dropdown Options for Calibration
    const calibrateFieldMapping = {
    "อุณหภูมิ": { userMin: "x_user_temp_min", userMax: "x_user_temp_max", ourMin: "x_our_temp_min", ourMax: "x_our_temp_max", mOur: "m_our_temp", cOur: "c_our_temp" },
    "ความชื้น": { userMin: "x_user_humi_min", userMax: "x_user_humi_max", ourMin: "x_our_humi_min", ourMax: "x_our_humi_max", mOur: "m_our_humi", cOur: "c_our_humi" },
    "ความดัน": { userMin: "x_user_pressure_min", userMax: "x_user_pressure_max", ourMin: "x_our_pressure_min", ourMax: "x_our_pressure_max", mOur: "m_our_pressure", cOur: "c_our_pressure" },
    "ความเข้มแสง": { userMin: "x_user_lux_min", userMax: "x_user_lux_max", ourMin: "x_our_lux_min", ourMax: "x_our_lux_max", mOur: "m_our_lux", cOur: "c_our_lux" },
    "อุณหภูมิดิน": { userMin: "x_user_st_min", userMax: "x_user_st_max", ourMin: "x_our_st_min", ourMax: "x_our_st_max", mOur: "m_our_st", cOur: "c_our_st" },
    "ความชื้นดิน": { userMin: "x_user_sh_min", userMax: "x_user_sh_max", ourMin: "x_our_sh_min", ourMax: "x_our_sh_max", mOur: "m_our_sh", cOur: "c_our_sh" },
    "ค่า ph": { userMin: "x_user_sph_min", userMax: "x_user_sph_max", ourMin: "x_our_sph_min", ourMax: "x_our_sph_max", mOur: "m_our_sph", cOur: "c_our_sph" },
    "การนำไฟฟ้า": { userMin: "x_user_sec_min", userMax: "x_user_sec_max", ourMin: "x_our_sec_min", ourMax: "x_our_sec_max", mOur: "m_our_sec", cOur: "c_our_sec" },
    "ไนโตรเจน": { userMin: "x_user_sn_min", userMax: "x_user_sn_max", ourMin: "x_our_sn_min", ourMax: "x_our_sn_max", mOur: "m_our_sn", cOur: "c_our_sn" },
    "ฟอสฟอรัส": { userMin: "x_user_sp_min", userMax: "x_user_sp_max", ourMin: "x_our_sp_min", ourMax: "x_our_sp_max", mOur: "m_our_sp", cOur: "c_our_sp" },
    "โพแทสเซียม": { userMin: "x_user_sk_min", userMax: "x_user_sk_max", ourMin: "x_our_sk_min", ourMax: "x_our_sk_max", mOur: "m_our_sk", cOur: "c_our_sk" },
    "ความเร็วลม": { userMin: "x_user_wind_min", userMax: "x_user_wind_max", ourMin: "x_our_wind_min", ourMax: "x_our_wind_max", mOur: "m_our_wind", cOur: "c_our_wind" },
    };

    const calibrationOptions = Object.keys(calibrateFieldMapping);

    // Data Refs
    const dataOptions = ref([]);
    const selectedData = ref("");
    const selectedCalibration = ref("");
    const userData = ref({
    placeNo: "",
    placeName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    uid: "",
    googleSheet: "",
    map: "",
    typeDurian1: "",
    typeDurian2: "",
    typeDurian3: "",
    });

    const calibrationFields = ref({
    userMin: "",
    userMax: "",
    ourMin: "",
    ourMax: "",
    mOur: "",
    cOur: "",
    });

    // Fetch User List
    const fetchUserList = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    dataOptions.value = querySnapshot.docs.map((doc) => ({
        text: doc.data().firstName,
        value: doc.id,
    }));
    };

    // Fetch User Data
    const fetchUserData = async (userId) => {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        userData.value = {
        placeNo: data.placeNo || "",
        placeName: data.placeName || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        password: data.password || "",
        uid: data.uid || "",
        googleSheet: data.googleSheet || "",
        map: data.map || "",
        typeDurian1: data.type_durian1 || "",
        typeDurian2: data.type_durian2 || "",
        typeDurian3: data.type_durian3 || "",
        };

        if (selectedCalibration.value) {
        const calibration = calibrateFieldMapping[selectedCalibration.value];
        calibrationFields.value = {
            userMin: data[calibration.userMin] || "",
            userMax: data[calibration.userMax] || "",
            ourMin: data[calibration.ourMin] || "",
            ourMax: data[calibration.ourMax] || "",
            mOur: data[calibration.mOur] || "",
            cOur: data[calibration.cOur] || "",
        };
        }
    }
    };

    // Update User Data
    const updateUserData = async (userId) => {
    const userRef = doc(db, "users", userId);

    const updatedData = {
        ...userData.value,
        ...(selectedCalibration.value && {
        [calibrateFieldMapping[selectedCalibration.value].userMin]: calibrationFields.value.userMin,
        [calibrateFieldMapping[selectedCalibration.value].userMax]: calibrationFields.value.userMax,
        [calibrateFieldMapping[selectedCalibration.value].ourMin]: calibrationFields.value.ourMin,
        [calibrateFieldMapping[selectedCalibration.value].ourMax]: calibrationFields.value.ourMax,
        [calibrateFieldMapping[selectedCalibration.value].mOur]: calibrationFields.value.mOur,
        [calibrateFieldMapping[selectedCalibration.value].cOur]: calibrationFields.value.cOur,
        }),
    };

    await updateDoc(userRef, updatedData);
    alert("User data updated successfully!");
    };

    onMounted(() => {
    fetchUserList();
    });
</script>



<template>
    <div class="flex flex-col justify-center items-center space-y-8 p-20">
        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Select Users :</h2>
            <select
                v-model="selectedData"
                class="w-1/2 h-1/6 px-4 py-3 rounded-lg bg-slate-200 text-gray-500 border border-none"
                @change="fetchUserData(selectedData)"
            >
                <option disabled value="">Select Users</option>
                <option v-for="option in dataOptions" :key="option.value" :value="option.value">
                {{ option.text }}
                </option>
            </select>
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="PlaceNo" class="block text-lg font-medium text-gray-200 w-1/6">
                Place No :
            </label>
            <input type="text" v-model="userData.placeNo" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Place No" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="Place" class="block text-lg font-medium text-gray-200 w-1/6">
                Place :
            </label>
            <input type="text" v-model="userData.placeName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Place" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="FirstName" class="block text-lg font-medium text-gray-200 w-2/4">
                FirstName :
            </label>
            <input type="text" v-model="userData.firstName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="FirstName" required />

            <label for="LastName" class="block text-lg font-medium text-gray-200 w-2/4">
                LastName :
            </label>
            <input type="text" v-model="userData.lastName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="LastName" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="Email" class="block text-lg font-medium text-gray-200 w-1/6">
                Email :
            </label>
            <input type="text" v-model="userData.email" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Email" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="Password" class="block text-lg font-medium text-gray-200 w-1/6">
                Password :
            </label>
            <input type="text" v-model="userData.password" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Password" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="UID" class="block text-lg font-medium text-gray-200 w-1/6">
                UID :
            </label>
            <input type="text" v-model="userData.uid" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="UID" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="GoogleSheet" class="block text-lg font-medium text-gray-200 w-1/6">
                GoogleSheet URL :
            </label>
            <input type="text" v-model="userData.googleSheet" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="GoogleSheet URL" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="GoogleMap" class="block text-lg font-medium text-gray-200 w-1/6">
                Google Map :
            </label>
            <input type="text" v-model="userData.map" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Google Map" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="TypeDurian1" class="block text-lg font-medium text-gray-200 w-3/6">
                Durian1 :
            </label>
            <input type="text" v-model="userData.typeDurian1" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Type Durian 1" required />

            <label for="TypeDurian2" class="block text-lg font-medium text-gray-200 w-3/6">
                Durian2 :
            </label>
            <input type="text" v-model="userData.typeDurian2" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Type Durian2" required />

            <label for="TypeDurian3" class="block text-lg font-medium text-gray-200 w-3/6">
                Durian3 :
            </label>
            <input type="text" v-model="userData.typeDurian3" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Type Durian3" required />
        </div>

        <hr class="border-lime-500/30 w-full" />

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Select Calibrations :</h2>
            <select
                v-model="selectedCalibration"
                class="w-1/2 h-1/6 px-4 py-3 rounded-lg bg-slate-200 text-gray-500 border border-none"
                @change="fetchUserData(selectedData)"
            >
                <option disabled value="">Select Calibration</option>
                <option v-for="option in calibrationOptions" :key="option" :value="option">
                {{ option }}
                </option>
            </select>
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <input type="text" v-model="x_user_min" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="x user min val" required />

            <input type="text" v-model="x_user_max" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="x user max val" required />

            <input type="text" v-model="m_user" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="m user val" required />

            <input type="text" v-model="c_user" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="c user val" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <input type="text" v-model="x_our_min" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="x our min val" required />

            <input type="text" v-model="x_our_max" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="x our max val" required />

            <input type="text" v-model="m_our" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="m our val" required />

            <input type="text" v-model="c_our" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="c our val" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <input type="text" v-model="y_user_min" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="y user val" required />

            <input type="text" v-model="y_user_max" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="y user val" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <input type="text" v-model="y_our_min" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="y our val" required />

            <input type="text" v-model="y_our_max" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="y our val" required />
        </div>

        <button
            class="px-8 py-4 w-1/6 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
            Save
        </button>
    </div>
</template>