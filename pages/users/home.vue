<script setup>
    // นำเข้าไอคอนรูปภาพ
    import iconPath1 from '~/assets/images/user.png';
    import iconPath2 from '~/assets/images/electric-pole.png';
    import iconPath3 from '~/assets/images/crisis.png';
    import iconPath4 from '~/assets/images/mark.png';

    // นำเข้า Vue composables
    import { useRoute, useRouter } from 'vue-router';
    import { ref, onMounted } from 'vue';

    // นำเข้า Firebase
    import { initializeApp } from 'firebase/app';
    import { getFirestore, doc, getDoc } from 'firebase/firestore';

    // ตั้งค่า Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
        authDomain: "checklogin-67a92.firebaseapp.com",
        projectId: "checklogin-67a92",
        storageBucket: "checklogin-67a92.appspot.com",
        messagingSenderId: "246538906966",
        appId: "1:246538906966:web:2e4399caaa96210df23af7",
        measurementId: "G-X3068LRCWT",
    };

    // Initialize Firebase และ Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Meta layout
    definePageMeta({
        layout: "defaultuser"
    });

    // ใช้ route และ router
    const route = useRoute();
    const router = useRouter();

    // ดึง UID จาก query parameter
    const uid = route.query.uid;
    console.log('User UID:', uid);

    // ฟังก์ชันนำทางไปหน้าอื่น พร้อม UID
    const navigateTo = (path) => {
        router.push({ path: path, query: { uid: uid } });
    };

    // State สำหรับเก็บรูปภาพแผนที่
    const Mapimages = ref('');

    // โหลดข้อมูลจาก Firestore
    const loadMapImage = async () => {
        if (uid) {
            try {
                const userDocRef = doc(db, 'users', uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    Mapimages.value = userData.map || '';
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        }
    };

    // โหลดข้อมูลเมื่อ component ถูก mount
    onMounted(() => {
        loadMapImage();
    });

    // ฟังก์ชันสำหรับ map pin
    const handlePinClick = () => {
        alert('Map Pin Clicked!');
    };
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16">
        <!-- top show -->
        <div class="flex justify-between items-center mt-20">
            <!-- user -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath1" alt="User Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">User</p>
                </div>
            </div>

            <!-- pole -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath2" alt="Pole Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">Pole</p>
                </div>
            </div>

            <!-- warning -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath3" alt="Warning Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">Warning</p>
                </div>
            </div>

            <!-- error -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath4" alt="Error Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">Error</p>
                </div>
            </div>
        </div>

        <!-- weather iframe -->
        <div class="w-full flex justify-center items-center">
            <iframe src="https://www.tmd.go.th/weatherForecast7DaysWidget?province=นนทบุรี" 
                scrolling="no" 
                frameborder="0" 
                class="w-full h-96 bg-transparent rounded-lg">
            </iframe>
        </div>   

        <!-- google map iframe -->
        <div class="relative w-full h-96 overflow-hidden rounded-lg flex justify-center items-center">
            <!-- Map Image -->
            <img :src="Mapimages" alt="Map Image" class="w-full h-96 object-cover" />

            <!-- Map Pin Icon -->
            <div 
                class="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                :style="{ top: '50%', left: '50%' }" 
                @click="handlePinClick"
            >
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                     alt="Map Pin" 
                     class="w-8 h-8" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.relative {
    position: relative;
}
.overflow-hidden {
    overflow: hidden;
}
.absolute {
    position: absolute;
}
.transform {
    transform: translate(-50%, -50%);
}

/* Responsive */
@media (min-width: 340px) and (max-width: 768px) {
    .pr-28, .pl-28 {
        padding-right: 16px;
        padding-left: 16px;
    }
    .w-56 {
        width: 45% !important;
    }
    .h-28 {
        height: 60px !important;
    }
    .text-xl {
        font-size: 1rem !important;
    }
    iframe {
        height: 250px !important;
    }
    .flex {
        flex-direction: column;
        align-items: start;
        margin-top: 10%;
    }
    .box_data {
        flex-direction: row;
        width: 100%;
    }
    img {
        width: 50px !important;
        height: 50px !important;
    }
}
</style>
