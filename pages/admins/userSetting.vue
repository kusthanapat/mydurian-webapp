<script setup>
    import { ref, onMounted, watch } from 'vue';
    import {
    initializeApp
    } from "firebase/app";
    import {getFirestore, collection, doc, getDoc, getDocs, updateDoc, setDoc} from "firebase/firestore";

    const firebaseConfig = {
    apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
    authDomain: "checklogin-67a92.firebaseapp.com",
    projectId: "checklogin-67a92",
    storageBucket: "checklogin-67a92.appspot.com",
    messagingSenderId: "246538906966",
    appId: "1:246538906966:web:2e4399caaa96210df23af7",
    measurementId: "G-X3068LRCWT",
    };

    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const pins = ref([]); // Map pins
    const poles = ref(1); // จำนวน pins (รับจาก Firestore)
    const isDragging = ref(null); // ตรวจสอบว่ากำลังลาก pin ไหน
    const mapPins = ref([]);
    const tooltipId = ref(null); // ID ของ tooltip ที่แสดง
    const tooltipStyle = ref({}); // Style ของ tooltip
    const mapImage = ref(null); // อ้างอิง map element




    // อัปเดต pins ตามจำนวน poles
    watch(poles, (newVal) => {
        // อัปเดต pins ตามจำนวน poles ที่เปลี่ยน
        const currentPins = pins.value;
        pins.value = Array.from({ length: newVal }, (_, i) => {
            // ใช้ค่าพิกัดเดิมถ้ามี หรือใช้ค่าเริ่มต้นถ้าเป็น pin ใหม่
            return currentPins[i] || {
                id: i + 1,
                x: 50,
                y: 50
            };
        });
    });

    definePageMeta({
        layout: "defaultadmin"
    });

    
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

    
    const dataOptions = ref([]);
    const selectedData = ref("");
    const selectedCalibration = ref("");

    const placeNo = ref('');
    const placeName = ref('');
    // const poles = ref(1);
    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const password = ref('');
    const uid = ref('');
    const googleSheet = ref('');
    const map = ref('');
    const typeDurian1 = ref('');
    const typeDurian2 = ref('');
    const typeDurian3 = ref('');

    const calibrationFields = ref({
    userMin: "",
    userMax: "",
    ourMin: "",
    ourMax: "",
    mOur: "",
    cOur: "",
    });

   
    const fetchUserList = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    dataOptions.value = querySnapshot.docs.map((doc) => ({
        text: doc.data().firstName,
        value: doc.id,
    }));
    };

    
    const fetchUserData = async (userId) => {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // อัพเดทค่าใน ref แต่ละตัว
            placeNo.value = data.placeNo || "";
            placeName.value = data.placeName || "";
            // poles.value = data.poles || "";
            poles.value = docSnap.data().poles || 1; // จำนวน map pins
            firstName.value = data.firstName || "";
            lastName.value = data.lastName || "";
            email.value = data.email || "";
            password.value = data.password || "";
            uid.value = data.uid || "";
            googleSheet.value = data.googleSheet || "";
            map.value = data.map || "";
            typeDurian1.value = data.type_durian1 || "";
            typeDurian2.value = data.type_durian2 || "";
            typeDurian3.value = data.type_durian3 || "";

            pins.value = Array.from({ length: data.poles || 1 }, (_, i) => {
                const pinId = i + 1;
                return {
                    id: pinId,
                    x: data[`coordinate_x_p${pinId}`] || 50, // ใช้ค่าพิกัดจาก Firestore หรือค่าเริ่มต้น
                    y: data[`coordinate_y_p${pinId}`] || 50
                };
            });

            // อัพเดท userData object ด้วย (ถ้าต้องการใช้)
            userData.value = {
                placeNo: data.placeNo || "",
                placeName: data.placeName || "",
                poles: data.poles || "",
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email || "",
                password: data.password || "",
                uid: data.uid || "",
                googleSheet: data.googleSheet || "",
                map: data.map || "",
                typeDurian1: data.type_durian1 || "",
                typeDurian2: data.type_durian2 || "",
                typeDurian3: data.type_durian3 || ""
            }

            // // ถ้ามีข้อมูล pins ที่บันทึกไว้ใน Firestore
            // if (data.mapPins) {
            // mapPins.value = data.mapPins
            // } else {
            // // สร้าง pins เริ่มต้นตามจำนวน poles
            // mapPins.value = Array(Number(data.poles)).fill(null).map((_, index) => ({
            //     x: 20 + (index * 15),
            //     y: 50
            // }))
            // }

            // new
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

    const updateUserData = async () => {
        if (!selectedData.value) {
            alert("กรุณาเลือกผู้ใช้ก่อน");
            return;
        }

        try {
            const userRef = doc(db, "users", selectedData.value);
            
            // ดึงข้อมูลเดิมมาก่อน
            const docSnap = await getDoc(userRef);
            const oldData = docSnap.exists() ? docSnap.data() : {};

            const coordinates = {};
            pins.value.forEach((pin) => {
                coordinates[`coordinate_x_p${pin.id}`] = pin.x;
                coordinates[`coordinate_y_p${pin.id}`] = pin.y;
            });
            
            // ลอง console.log เพื่อดูค่าที่จะอัพเดท
            console.log("Values to update:", {
                placeNo: placeNo.value,
                placeName: placeName.value,
                poles: poles.value,
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value,
                googleSheet: googleSheet.value,
                map: map.value,
                type_durian1: typeDurian1.value,
                type_durian2: typeDurian2.value,
                type_durian3: typeDurian3.value
            });

            const updatedData = {
                // ไม่ใช้ OR operator แล้ว เพราะอาจทำให้ค่าว่างถูกแทนที่ด้วยค่าเดิม
                placeNo: placeNo.value,
                placeName: placeName.value,
                poles: poles.value,
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value,
                uid: selectedData.value,
                googleSheet: googleSheet.value,
                map: map.value,
                type_durian1: typeDurian1.value,
                type_durian2: typeDurian2.value,
                type_durian3: typeDurian3.value,
                ...coordinates // เพิ่มข้อมูลพิกัดเข้าไปใน updatedData
            };

            // ลบฟิลด์ที่มีค่า undefined หรือ null ออก
            Object.keys(updatedData).forEach(key => {
                if (updatedData[key] === undefined || updatedData[key] === null) {
                    delete updatedData[key];
                }
            });

            // ลอง console.log ข้อมูลที่จะส่งไป Firebase
            console.log("Data being sent to Firebase:", updatedData);

            // ใช้ setDoc แทน updateDoc เพื่อให้แน่ใจว่าข้อมูลถูกบันทึก
            await setDoc(userRef, updatedData, { merge: true });
            
            alert("อัพเดทข้อมูลสำเร็จ!");
            // โหลดข้อมูลใหม่หลังจากอัพเดท
            await fetchUserData(selectedData.value);
        } catch (error) {
            console.error("Error updating user data: ", error);
            alert("เกิดข้อผิดพลาดในการอัพเดทข้อมูล: " + error.message);
        }
    };



    const x_user_min = ref('');
    const x_user_max = ref('');
    const m_user = ref(1); 
    const c_user = ref(0); 
    const x_our_min = ref('');
    const x_our_max = ref('');
    const m_our = ref(1); 
    const c_our = ref(0); 
    const y_user_min = ref('');
    const y_user_max = ref('');
    const y_our_min = ref('');
    const y_our_max = ref('');

    function autoTune() {
        const x1_min = parseFloat(x_user_min.value) || 0;
        const x1_max = parseFloat(x_user_max.value) || 0;
        const m1 = parseFloat(m_user.value) || 1; 
        const c1 = parseFloat(c_user.value) || 0; 

        const x2_min = parseFloat(x_our_min.value) || 0;
        const x2_max = parseFloat(x_our_max.value) || 0;

        
        if (x2_max - x2_min === 0) {
            console.error('Division by zero is not allowed.');
            return;
        }

        
        const y1_min = m1 * x1_min + c1;
        const y1_max = m1 * x1_max + c1;

        
        const m2 = (y1_max - y1_min) / (x2_max - x2_min);
        const c2 = y1_min - m2 * x2_min;

        
        m_our.value = m2.toFixed(4) || 1; 
        c_our.value = c2.toFixed(4) || 0; 

        
        const y2_min = m2 * x2_min + c2;
        const y2_max = m2 * x2_max + c2;

       
        y_user_min.value = y1_min.toFixed(4);
        y_user_max.value = y1_max.toFixed(4);
        y_our_min.value = y2_min.toFixed(4);
        y_our_max.value = y2_max.toFixed(4);
    }

    // เริ่มต้นการลาก
    const startDragging = (event, pinId) => {
    isDragging.value = pinId;
    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", stopDragging);
    };

    // การจัดการการลาก
    const handleDragging = (event) => {
    if (!isDragging.value || !mapImage.value) return;

    const rect = mapImage.value.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const pin = pins.value.find((p) => p.id === isDragging.value);
    if (pin) {
        pin.x = Math.min(Math.max(0, x), 100);
        pin.y = Math.min(Math.max(0, y), 100);
    }

    updateTooltipPosition(pin);
    };

    // หยุดการลาก
    const stopDragging = () => {
    isDragging.value = null;
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", stopDragging);
    };

    // แสดง tooltip
    const showTooltip = (pinId) => {
        tooltipId.value = pinId;
        const pin = pins.value.find((p) => p.id === pinId);
        if (pin) updateTooltipPosition(pin);
    };

    // ซ่อน tooltip
    const hideTooltip = () => {
    tooltipId.value = null;
    };

    // อัปเดตตำแหน่งของ tooltip
    const updateTooltipPosition = (pin) => {
    tooltipStyle.value = {
        position: "absolute",
        top: `${pin.y}%`,
        left: `${pin.x}%`,
        transform: "translate(-50%, -120%)",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        padding: "5px 10px",
        borderRadius: "4px",
        pointerEvents: "none",
    };
    };

    // Cleanup เมื่อ component ถูก unmounted
    onUnmounted(() => {
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", stopDragging);
    });

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
            <input type="text" v-model="placeNo" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Place No" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="Place" class="block text-lg font-medium text-gray-200 w-1/6">
                Place :
            </label>
            <input type="text" v-model="placeName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Place" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="Pole" class="block text-lg font-medium text-gray-200 w-1/6">
                Pole :
            </label>
            <input type="text" v-model="poles" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Poles" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="FirstName" class="block text-lg font-medium text-gray-200 w-2/4">
                FirstName :
            </label>
            <input type="text" v-model="firstName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="FirstName" required />

            <label for="LastName" class="block text-lg font-medium text-gray-200 w-2/4">
                LastName :
            </label>
            <input type="text" v-model="lastName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="LastName" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="Email" class="block text-lg font-medium text-gray-200 w-1/6">
                Email :
            </label>
            <input type="text" v-model="email" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Email" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="Password" class="block text-lg font-medium text-gray-200 w-1/6">
                Password :
            </label>
            <input type="text" v-model="password" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Password" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="UID" class="block text-lg font-medium text-gray-200 w-1/6">
                UID :
            </label>
            <input type="text" v-model="uid" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="UID" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="GoogleSheet" class="block text-lg font-medium text-gray-200 w-1/6">
                GoogleSheet URL :
            </label>
            <input type="text" v-model="googleSheet" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="GoogleSheet URL" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="GoogleMap" class="block text-lg font-medium text-gray-200 w-1/6">
                Google Map :
            </label>
            <input type="text" v-model="map" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Google Map" required />
        </div>

        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <label for="TypeDurian1" class="block text-lg font-medium text-gray-200 w-3/6">
                Durian1 :
            </label>
            <input type="text" v-model="typeDurian1" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Type Durian 1" required />

            <label for="TypeDurian2" class="block text-lg font-medium text-gray-200 w-3/6">
                Durian2 :
            </label>
            <input type="text" v-model="typeDurian2" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Type Durian2" required />

            <label for="TypeDurian3" class="block text-lg font-medium text-gray-200 w-3/6">
                Durian3 :
            </label>
            <input type="text" v-model="typeDurian3" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Type Durian3" required />
        </div>

        <h2 class="text-2xl text-white font-bold mb-2 text-start">User Map</h2>

        <div ref="mapImage" class="map-container relative flex flex-col w-full h-96 overflow-hidden rounded-lg justify-center items-center mt-6">
            <img :src="map" 
                alt="Map Image" 
                class="w-full h-96 object-cover" 
                ref="mapImage" />
            <div
                v-for="pin in pins"
                :key="pin.id"
                :style="{
                position: 'absolute',
                top: pin.y + '%',
                left: pin.x + '%',
                transform: 'translate(-50%, -50%)',
                cursor: isDragging === pin.id ? 'grabbing' : 'grab',
                }"
                class="map-pin"
                @mousedown="(event) => startDragging(event, pin.id)"
                @mouseover="() => showTooltip(pin.id)"
                @mouseleave="hideTooltip"
            >
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Map Pin"  class="w-8 h-8" />
                    
            <!-- เพิ่ม tooltip element -->
            <div v-if="tooltipId === pin.id" 
                class="tooltip"
                :style="tooltipStyle">
                Pin {{ pin.id }} Position:
                X: {{ pin.x.toFixed(1) }}%, 
                Y: {{ pin.y.toFixed(1) }}%
            </div>
            </div>
        </div>

        <!-- <div class="relative flex flex-col w-full h-96 overflow-hidden rounded-lg justify-center items-center mt-6">
            
            <img :src="map" 
                alt="Map Image" 
                class="w-full h-96 object-cover" 
                ref="mapImage" />


            <div 
                class="absolute cursor-move transform -translate-x-1/2 -translate-y-1/2"
                :style="{ top: pinPosition.y + '%', left: pinPosition.x + '%' }" 
                @mousedown.prevent="startDragging"
            >
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                    alt="Map Pin" 
                    class="w-8 h-8" />
            </div>
        </div> -->

        <button
            @click="" class="px-8 py-4 w-1/6 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
            Save
        </button>

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
            @click="autoTune" class="px-8 py-4 w-1/6 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
            Auto tune
        </button>

        <button
            @click="updateUserData()" class="px-8 py-4 w-1/6 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
            Save
        </button>
    </div>
</template>

<style>
    /* .map-container {
    position: relative;
    width: 100%;
    height: 500px;
    background-color: lightgray;
    } */

    .map-pin {
    position: absolute;
    cursor: pointer;
    }

    .tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 1000;
        transform: translate(-50%, -120%);
    }
</style>