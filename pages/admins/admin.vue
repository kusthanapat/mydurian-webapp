<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router'; 
    import { initializeApp } from 'firebase/app';
    import { getFirestore, collection, getDocs, doc, getDoc, setDoc, query, where } from 'firebase/firestore';

    definePageMeta({
        layout: "defaultadmin"
    });

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
        authDomain: "checklogin-67a92.firebaseapp.com",
        projectId: "checklogin-67a92",
        storageBucket: "checklogin-67a92.appspot.com",
        messagingSenderId: "246538906966",
        appId: "1:246538906966:web:2e4399caaa96210df23af7",
        measurementId: "G-X3068LRCWT"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Refs
    const usersData = ref([]);
    const pins = ref([]); // สำหรับเก็บข้อมูล pins ทั้งหมด
    const isDragging = ref(null); // ตรวจสอบว่ากำลังลาก pin ไหน
    const tooltipId = ref(null); // ID ของ tooltip ที่แสดง
    const tooltipStyle = ref({}); // Style ของ tooltip
    const mapImage = ref(null); // อ้างอิง map element
    const adminUid = ref(null); // เก็บ uid ของ admin
    

    const Mapimages = 'https://www.robotoops.com/imagesMydurian/forindex/overall.jpg';

    // ฟังก์ชันสร้าง pins จากข้อมูล users
    const createPinsFromUsers = (users) => {
        let allPins = [];
        users.forEach(user => {
            for (let i = 1; i <= user.poles; i++) {
                allPins.push({
                    id: `${user.placeName}_${i}`,
                    placeName: user.placeName,
                    poleNumber: i,
                    x: 50, // ค่าเริ่มต้น
                    y: 50  // ค่าเริ่มต้น
                });
            }
        });
        return allPins;
    };

    // ฟังก์ชันดึงข้อมูลจาก Firestore olddd
    // const fetchUserData = async () => {
    //     const querySnapshot = await getDocs(collection(db, "users"));
    //     usersData.value = querySnapshot.docs.map(doc => ({
    //         placeNo: doc.data().placeNo || '-',
    //         placeName: doc.data().placeName || '-',
    //         firstName: doc.data().firstName || '-',
    //         poles: doc.data().poles || '-',
    //         status: 'Good',
    //         userpage: `${doc.data().firstName || '-'} Page`
    //     }));
    // };

    // ฟังก์ชันดึงข้อมูลจาก Firestore
    const fetchUserData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const users = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                placeNo: doc.data().placeNo || '-',
                placeName: doc.data().placeName || '-',
                firstName: doc.data().firstName || '-',
                poles: doc.data().poles || '-',
                status: 'Good',
                userpage: `${doc.data().firstName || '-'} Page`
            }));
            usersData.value = users;
            
            // หา admin uid
            const adminQuery = query(collection(db, "users"), where("status", "==", "admin"));
            const adminSnapshot = await getDocs(adminQuery);
            if (!adminSnapshot.empty) {
                adminUid.value = adminSnapshot.docs[0].id;
                // โหลดตำแหน่ง pins ที่บันทึกไว้
                await loadSavedPinPositions(users);
            } else {
                pins.value = createPinsFromUsers(users);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const router = useRouter(); // สร้าง router instance

    // ฟังก์ชันเปลี่ยนหน้าไปยัง `home.vue` ของ User
    const goToUserHome = (user) => {
        if (user.uid) {
            router.push(`/home?uid=${encodeURIComponent(user.uid)}`);
        }
    };

    // โหลดตำแหน่ง pins ที่บันทึกไว้
    const loadSavedPinPositions = async (users) => {
        if (!adminUid.value) return;

        try {
            const adminDoc = await getDoc(doc(db, "users", adminUid.value));
            if (adminDoc.exists()) {
                const adminData = adminDoc.data();
                const newPins = createPinsFromUsers(users);
                
                newPins.forEach(pin => {
                    const xField = `coordinate_x_${pin.placeName}_${pin.poleNumber}`;
                    const yField = `coordinate_y_${pin.placeName}_${pin.poleNumber}`;
                    
                    if (adminData[xField] !== undefined && adminData[yField] !== undefined) {
                        pin.x = adminData[xField];
                        pin.y = adminData[yField];
                    }
                });
                
                pins.value = newPins;
            }
        } catch (error) {
            console.error("Error loading saved positions:", error);
        }
    };

    // เริ่มการลาก
    const startDragging = (event, pinId) => {
        isDragging.value = pinId;
        document.addEventListener('mousemove', handleDragging);
        document.addEventListener('mouseup', stopDragging);
    };

    // จัดการการลาก
    const handleDragging = (event) => {
        if (!isDragging.value || !mapImage.value) return;

        const mapRect = mapImage.value.getBoundingClientRect();
        let x = ((event.clientX - mapRect.left) / mapRect.width) * 100;
        let y = ((event.clientY - mapRect.top) / mapRect.height) * 100;

        // จำกัดให้อยู่ในกรอบ
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        const pinIndex = pins.value.findIndex(p => p.id === isDragging.value);
        if (pinIndex !== -1) {
            pins.value[pinIndex].x = x;
            pins.value[pinIndex].y = y;
        }
    };

    // หยุดการลาก
    const stopDragging = () => {
        isDragging.value = null;
        document.removeEventListener('mousemove', handleDragging);
        document.removeEventListener('mouseup', stopDragging);
    };

    // แสดง tooltip
    const showTooltip = (pin) => {
        tooltipId.value = pin.id;
        tooltipStyle.value = {
            position: 'absolute',
            top: `${pin.y}%`,
            left: `${pin.x}%`,
            transform: 'translate(-50%, -120%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1000
        };
    };

    // ซ่อน tooltip
    const hideTooltip = () => {
        tooltipId.value = null;
    };

    // บันทึกตำแหน่ง pins
    const savePinPositions = async () => {
        if (!adminUid.value) return;

        try {
            const updates = {};
            pins.value.forEach(pin => {
                updates[`coordinate_x_${pin.placeName}_${pin.poleNumber}`] = pin.x;
                updates[`coordinate_y_${pin.placeName}_${pin.poleNumber}`] = pin.y;
            });

            await setDoc(doc(db, "users", adminUid.value), updates, { merge: true });
            alert('Positions saved successfully!');
        } catch (error) {
            console.error("Error saving positions:", error);
            alert('Error saving positions');
        }
    };

    
    onMounted(() => {
        fetchUserData();
        mapImage.value = document.querySelector('.map-image');
    });
</script>

<template>
    <div class="w-full h-full bg-slate-100 flex flex-col space-y-16 pr-28 pl-28">
        <div class="flex mt-20 justify-between">
            <h2 class="text-2xl text-gray-700 font-bold mb-2 text-start">All Stations</h2>

            <button
                @click="savePinPositions" class="px-8 py-4 w-1/6 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                Save
            </button>
        </div>
        <!-- google map iframe overall oldd-->
        <!-- <div class="relative flex flex-col w-full h-1/6 overflow-hidden rounded-lg  justify-center items-center">
            
            <img :src="Mapimages" alt="Map Image" class="w-full h-1/6 object-cover" />

            
            <div 
                class="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                :style="{ top: '50%', left: '50%' }" 
                @click="handlePinClick"
            >
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                     alt="Map Pin" 
                     class="w-8 h-8" />
            </div>
        </div> -->

        <!-- google map iframe overall new-->
        <div class="relative flex flex-col w-full h-1/6 overflow-hidden rounded-lg justify-center items-center">
            <!-- Map Image -->
            <img 
                :src="Mapimages" 
                alt="Map Image" 
                class="w-full h-1/6 object-cover map-image" 
                ref="mapImage"
            />

            <!-- Map Pins -->
            <div
                v-for="pin in pins"
                :key="pin.id"
                :style="{
                    position: 'absolute',
                    top: pin.y + '%',
                    left: pin.x + '%',
                    transform: 'translate(-50%, -50%)',
                    cursor: isDragging === pin.id ? 'grabbing' : 'grab',
                    zIndex: isDragging === pin.id ? 1000 : 1
                }"
                class="map-pin"
                @mousedown="(event) => startDragging(event, pin.id)"
                @mouseover="() => showTooltip(pin)"
                @mouseleave="hideTooltip"
            >
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                    alt="Map Pin" 
                    class="w-8 h-8"
                />
                
                <!-- Tooltip -->
                <div 
                    v-if="tooltipId === pin.id"
                    :style="tooltipStyle"
                >
                    {{ pin.placeName }}, Pole {{ pin.poleNumber }}
                </div>
            </div>
        </div>
        
        <div class="p-10">
            <h2 class="text-3xl font-bold mb-6 text-gray-700">User Table</h2>
                <div class="bg-white p-4 rounded-lg shadow-lg">
                    <table class="min-w-full border border-gray-800 border-collapse rounded-lg overflow-hidden shadow-md">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Place No</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Place Name</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">FirstName</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Pole</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Status</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">UserPage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in usersData" :key="index" class="bg-white hover:bg-gray-100">
                                <td class="px-4 py-2 border border-gray-300">{{ user.placeNo }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.placeName }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.firstName }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.poles }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.status }}</td>
                                <td class="px-4 py-2 border border-gray-300 cursor-pointer" @click="goToUserHome(user)">{{ user.userpage}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
        </div>
    </div>
</template>

<style scoped>
    .map-pin {
        transition: all 0.1s ease;
    }

    .map-pin:hover {
        z-index: 1000;
    }
</style>