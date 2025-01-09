<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';

  // นำเข้า Firebase
  import { initializeApp } from 'firebase/app';
  import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

  // Add new function to determine tooltip color
  const getTooltipColor = (statusEmoji) => {
    switch(statusEmoji) {
      case happyface:
        return 'rgba(34, 197, 94, 0.9)';  // green with opacity
      case neutralface:
        return 'rgba(234, 179, 8, 0.9)';  // yellow with opacity
      case sadface:
        return 'rgba(239, 68, 68, 0.9)';  // red with opacity
      default:
        return 'rgba(0, 0, 0, 0.8)';
    }
  };

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

  // Import images
  import iconPath from '~/assets/images/icon_durian.png';
  import iconPath8 from '~/assets/images/smart_pic_use3.png';
  
  const dynamicImage = 'https://robotoops.com/imagesMydurian/forindex/temp-dashboard.jfif';
  const Overallimages = 'https://www.robotoops.com/imagesMydurian/forindex/overall.jpg';

  // Emoji URLs
  const happyface = 'https://www.robotoops.com/imagesMydurian/forindex/happy.png';
  const neutralface = 'https://www.robotoops.com/imagesMydurian/forindex/neutral.png';
  const sadface = 'https://www.robotoops.com/imagesMydurian/forindex/sad-face.png';

  const pins = ref([]); // Map pins
  const poles = ref(1); // จำนวน pins (รับจาก Firestore)
  const isDragging = ref(null); // ตรวจสอบว่ากำลังลาก pin ไหน
  const mapPins = ref([]);
  const tooltipId = ref(null); // ID ของ tooltip ที่แสดง
  // Update tooltip style object
  const tooltipStyle = ref({
    position: 'absolute',
    top: '0',
    left: '0',
    transform: 'translate(-50%, -120%)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    zIndex: 1000,
    pointerEvents: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    minWidth: '200px'
  });
  const mapImage = ref(null); // อ้างอิง map element

  const exam1 = 'https://www.robotoops.com/imagesMydurian/forindex/news2.jpg'
  const exam2 = 'https://www.robotoops.com/imagesMydurian/forindex/news3.jpg'
  const exam3 = 'https://www.robotoops.com/imagesMydurian/forindex/post_pic3.jpg'

  const examples = [
    {
      id: 1,
      src: exam1,
      alt: "แลกเปลี่ยนความรู้",
      description: "พูดคุยกับเกษตรกรเพื่อแลกเปลี่ยนความรู้"
    },
    {
      id: 2,
      src: exam2,
      alt: "สอนการใช้งานเว็บไซต์",
      description: "สอนการใช้งานเว็บไซต์ การดูข้อมูลต่างๆกับเกษตรกร"
    },
    {
      id: 3,
      src: exam3,
      alt: "ติดตั้งเสา IoT",
      description: "ติดตั้งเสา IoT สำหรับสวนทุเรียนให้กับเกษตรกร"
    },
  ];

  const imageUrls = {
    Dashboard: 'https://robotoops.com/imagesMydurian/forindex/temp-dashboard.jfif',
    Chart: 'https://robotoops.com/imagesMydurian/forindex/chart.jfif',
  };

  const currentSlide = ref(0);
  const totalSlides = 2;

  const changeSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % totalSlides;
  };

  const adminPins = ref([]);

  // แก้ไขฟังก์ชัน loadAdminPins
  const loadAdminPins = async () => {
    try {
        const usersRef = collection(db, 'users');
        const adminQuery = query(usersRef, where('status', '==', 'admin'));
        const querySnapshot = await getDocs(adminQuery);

        const pins = [];
        
        for (const adminDoc of querySnapshot.docs) {
            const adminData = adminDoc.data();
            
            const googleSheetUrl = adminData.googleSheet;
            
            let latestData = null;
            // เพิ่มการตรวจสอบว่าเป็น URL ที่ถูกต้องหรือไม่
            if (googleSheetUrl && 
                googleSheetUrl.trim() !== '' && 
                googleSheetUrl.startsWith('http')) {  // เช็คว่าเป็น URL จริงๆ
                try {
                    const response = await fetch(googleSheetUrl);
                    
                    if (!response.ok) {
                        console.log('Failed to fetch Google Sheet:', googleSheetUrl);
                        throw new Error('Failed to fetch');
                    }

                    const data = await response.json();
                    
                    if (data && 
                        Array.isArray(data) && 
                        data.length > 0 && 
                        data[data.length - 1].hasOwnProperty('อุณหภูมิ_c')) {
                        latestData = data[data.length - 1];
                    } else {
                        console.log('Invalid data format from sheet:', googleSheetUrl);
                    }
                } catch (error) {
                    console.log('Error fetching sheet:', error);
                }
            } else {
                console.log('Invalid Google Sheet URL:', googleSheetUrl);
            }

            const fields = Object.keys(adminData);
            const coordinateFields = fields.filter(field => 
                field.startsWith('coordinate_x_') || field.startsWith('coordinate_y_')
            );

            const locations = new Set(
                coordinateFields.map(field => {
                    const match = field.match(/coordinate_[xy]_(.+)/);
                    return match ? match[1] : null;
                }).filter(Boolean)
            );

            for (const location of locations) {
                const [locationName, poleNumber] = location.split('_');
                const status = getStatusEmoji(latestData);
                pins.push({
                    id: location,
                    x: adminData[`coordinate_x_${location}`] || 50,
                    y: adminData[`coordinate_y_${location}`] || 50,
                    locationName: locationName,
                    poleNumber: poleNumber,
                    sensorData: latestData,
                    statusEmoji: status.url,
                    statusColor: status.color
                });
            }
        }

        adminPins.value = pins;
        console.log('Loaded admin pins:', adminPins.value);
    } catch (error) {
        console.error('Error loading admin pins:', error);
    }
};

    // ปรับปรุงฟังก์ชัน getStatusEmoji ให้ส่งคืนทั้ง URL และสี
    const getStatusEmoji = (sensorData) => {
      // เพิ่ม console.log ตรงนี้เพื่อดูข้อมูลทั้งหมดที่เข้ามา
      console.log('Received sensorData:', sensorData);

      if (!sensorData) {
        console.log('sensorData is null or undefined');
        return { url: happyface, color: '#23ff00' };
      }

      // ตรวจสอบค่าแต่ละตัว
      console.log('Temperature sensorData:', sensorData.อุณหภูมิ_c);
      console.log('Humidity sensorData:', sensorData.ความชื้น_เปอร์เซ็นต์);
      console.log('Soil Humidity sensorData:', sensorData.ความชื้นดิน_เปอร์เซ็นต์);
      console.log('Soil Temperature sensorData:', sensorData.อุณหภูมิดิน_c);
      console.log('PH sensorData:', sensorData.PH);
      console.log('EC sensorData:', sensorData.ความเค็ม_เปอร์เซ็นต์);
      console.log('Nitrogen sensorData:', sensorData.ไนโตรเจน_เปอร์เซ็นต์);
      console.log('Phosphorus sensorData:', sensorData.ฟอสฟอรัส_เปอร์เซ็นต์);
      console.log('Potassium sensorData:', sensorData.โพแทสเซียม_เปอร์เซ็นต์);
      if (!sensorData) return { url: happyface, color: '#23ff00' };

      // Temperature conditions
      if (sensorData.อุณหภูมิ_c >= 40) return { url: sadface, color: '#ff0000' };
      if (sensorData.อุณหภูมิ_c >= 35 && sensorData.อุณหภูมิ_c < 40) return { url: neutralface, color: '#fff300' };

      // Humidity conditions
      if (sensorData.ความชื้น_เปอร์เซ็นต์ <= 60 || sensorData.ความชื้น_เปอร์เซ็นต์ >= 80) return { url: sadface, color: '#ff0000' };
      if (sensorData.ความชื้น_เปอร์เซ็นต์ <= 55 || sensorData.ความชื้น_เปอร์เซ็นต์ >= 75) return { url: neutralface, color: '#fff300' };

      // Soil Humidity conditions
      if (sensorData.ความชื้นดิน_เปอร์เซ็นต์ <= 20 || sensorData.ความชื้นดิน_เปอร์เซ็นต์ >= 40) return { url: sadface, color: '#ff0000' };
      if (sensorData.ความชื้นดิน_เปอร์เซ็นต์ <= 25 || sensorData.ความชื้นดิน_เปอร์เซ็นต์ >= 45) return { url: neutralface, color: '#fff300' };

      // Soil Temperature conditions
      if (sensorData.อุณหภูมิดิน_c >= 35) return { url: sadface, color: '#ff0000' };
      if (sensorData.อุณหภูมิดิน_c >= 30 && sensorData.อุณหภูมิดิน_c < 35) return { url: neutralface, color: '#fff300' };

      // Soil pH conditions
      if (sensorData.PH >= 8) return { url: sadface, color: '#ff0000' };
      if (sensorData.PH >= 7 && sensorData.PH < 8) return { url: neutralface, color: '#fff300' };

      // Soil EC conditions
      if (sensorData.ความเค็ม_เปอร์เซ็นต์ >= 1.2) return { url: sadface, color: '#ff0000' };
      if (sensorData.ความเค็ม_เปอร์เซ็นต์ >= 1 && sensorData.ความเค็ม_เปอร์เซ็นต์ < 1.2) return { url: neutralface, color: '#fff300' };

      // Soil Nutrients conditions
      if (sensorData.ไนโตรเจน_เปอร์เซ็นต์ >= 15) return { url: sadface, color: '#ff0000' };
      if (sensorData.ไนโตรเจน_เปอร์เซ็นต์ >= 12 && sensorData.ไนโตรเจน_เปอร์เซ็นต์ < 15) return { url: neutralface, color: '#fff300' };
      
      if (sensorData.ฟอสฟอรัส_เปอร์เซ็นต์ >= 15) return { url: sadface, color: '#ff0000' };
      if (sensorData.ฟอสฟอรัส_เปอร์เซ็นต์ >= 12 && sensorData.ฟอสฟอรัส_เปอร์เซ็นต์ < 15) return { url: neutralface, color: '#fff300' };
      
      if (sensorData.โพแทสเซียม_เปอร์เซ็นต์ >= 15) return { url: sadface, color: '#ff0000' };
      if (sensorData.โพแทสเซียม_เปอร์เซ็นต์ >= 12 && sensorData.โพแทสเซียม_เปอร์เซ็นต์ < 15) return { url: neutralface, color: '#fff300' };

      return { url: happyface, color: '#23ff00' };
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
      zIndex: 1000,
      pointerEvents: 'none'
    };
  };

  const hideTooltip = () => {
    tooltipId.value = null;
  };

  // โหลดข้อมูลเมื่อ component ถูก mount
  onMounted(() => {
    loadAdminPins();
  });

  onMounted(() => {
    const interval = setInterval(changeSlide, 5000);
    onUnmounted(() => {
      clearInterval(interval);
    });
  });
  
</script>

<template>
  <!-- Hero Section -->
  <div class="relative">
    <div class="carousel-container">
      <TransitionGroup name="slide" class="flex justify-between">
        <div v-for="index in 2" v-show="currentSlide === index - 1" :key="index"
          class="min-h-screen w-full flex items-center justify-between px-8 md:px-20"
          :class="index === 1 ? 'bg-black/90' : 'bg-gradient-to-r from-black/90 to-fuchsia-900/90'">

          <div class="flex-1 space-y-8 mt-20 max-w-2xl">
            <div class="space-y-4">
              <h1 class="text-4xl md:text-7xl text-white font-bold tracking-tight font-prompt">
                SMART FARM <div class="text-lime-400">KMUTNB</div>
              </h1>
              <h2 class="text-3xl md:text-5xl text-white/90 font-light font-prompt">
                for Nontaburi farmers
              </h2>
            </div>

            <div class="space-y-3 text-gray-400">
              <p class="text-xl font-light font-prompt">โครงการสมาร์ทฟาร์มพัฒนาการเกษตร</p>
              <p class="text-xl font-light font-prompt">ภายใต้ความร่วมมือระหว่าง กระทรวงเกษตรนนทบุรีและ</p>
              <p class="text-xl font-light font-prompt">มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ</p>
            </div>
          </div>

          <div class="hidden md:block">
            <img :src="index === 1 ? iconPath : iconPath8"
              class="w-full max-w-xl transform scale-80 hover:scale-155 transition-transform"
              :alt="index === 1 ? 'Durian' : 'Smart Farm'" />
          </div>
        </div>
      </TransitionGroup>

      <!-- Enhanced Navigation Dots -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button v-for="index in 2" :key="index" @click="currentSlide = index - 1"
          class="w-20 h-2 rounded-full transition-all"
          :class="currentSlide === index - 1 ? 'bg-lime-400 scale-110' : 'bg-white/30 hover:bg-white/50'">
        </button>
      </div>
    </div>
  </div>

  <!-- Enhanced Example Section -->
  <section class="bg-neutral-900/50 py-24 px-8 md:px-20">
    <h2 class="text-4xl text-white font-bold mb-16 text-center">Example Solutions</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        v-for="example in examples"
        :key="example.id"
        class="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-xl hover:shadow-lime-500/20 transform hover:scale-105 transition-all duration-300"
      >
        <img
          :src="example.src"
          :alt="example.alt"
          class="w-full h-48 object-cover hover:opacity-90 transition-opacity"
        />
        <div class="p-6">
          <h3 class="text-xl font-semibold text-white">Example {{ example.id }}</h3>
          <p class="mt-2 text-gray-400">{{ example.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Enhanced Benefits Section -->
  <section class="py-24 px-8 md:px-20 bg-black/80">
    <div class="flex flex-col md:flex-row justify-between gap-16">
      <div class="md:w-1/2 space-y-8">
        <h2 class="text-5xl font-bold text-lime-400">Benefits</h2>
        <div class="space-y-6">
          <p class="text-xl text-gray-300 leading-relaxed">
            ผู้ใช้บริการหลังจากลงทะเบียนเป็นสมาชิกแล้ว
            สามารถดูข้อมูลแบบเรียลไทม์จากเซ็นเซอร์ที่ติดตั้งในฟาร์มทุเรียน
            ผ่านทางเว็บไซต์ซึ่งมีทั้งแดชบอร์ดและกราฟ
          </p>
          <p class="text-xl text-gray-300 leading-relaxed">
            ผู้ใช้ยังสามารถดาวน์โหลดข้อมูลเป็นไฟล์ CSV 
            เพื่อนำไปใช้ต่อและดูข้อมูลย้อนหลังพร้อมรับการแจ้งเตือนผ่าน Line Notify ได้อีกด้วย
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 pt-8">
          <nuxt-link to="dashboardExam" class="px-8 py-4 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
            ตัวอย่างแดชบอร์ด
          </nuxt-link>
          
          <nuxt-link to="chartExam" class="px-8 py-4 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
            ตัวอย่างกราฟ
          </nuxt-link>
        </div>
      </div>

      <div class="md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="(type, index) in ['Dashboard', 'Chart']"
          :key="index"
          class="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-xl hover:shadow-lime-500/20 transform hover:scale-105 transition-all duration-300"
        >
          <img
            :src="imageUrls[type]"
            class="w-full h-48 object-cover hover:opacity-90 transition-opacity"
            :alt="type"
          />
          <div class="p-6">
            <h3 class="text-xl font-semibold text-white">{{ type }}</h3>
            <p class="mt-2 text-gray-400">
              Interactive and customizable {{ type.toLowerCase() }} for data visualization.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
      <div class="flex flex-col md:flex-row justify-between gap-16 pl-12 pt-10 pb-10">
        <h2 class="text-5xl font-bold text-gray-400">ภาพรวม</h2>
      </div>
      
      <!-- google map iframe overall -->
      <div class="relative flex flex-col w-full h-1/6 overflow-hidden rounded-lg justify-center items-center pl-12 pr-12">
          <!-- Map Image -->
          <img :src="Overallimages" alt="Map Image" class="w-full h-1/6 object-cover rounded-md" />

          <!-- Admin Map Pins -->
          <div
              v-for="pin in adminPins"
              :key="pin.id"
              class="absolute cursor-pointer"
              :style="{
                  top: pin.y + '%',
                  left: pin.x + '%',
                  transform: 'translate(-50%, -50%)'
              }"
              @mouseover="() => showTooltip(pin)"
              @mouseleave="hideTooltip"
          >
              <img 
                  src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                  alt="Map Pin" 
                  class="w-8 h-8"
              />
              <!-- Updated Tooltip with Emoji -->
              <div 
                  v-if="tooltipId === pin.id"
                  class="tooltip"
                  :style="tooltipStyle"
              >
                  <div>Location: {{ pin.locationName }}</div>
                  <div class="flex items-center gap-2">
                      Pole: {{ pin.poleNumber }}
                      <img 
                        :src="pin.statusEmoji" 
                        alt="Status" 
                        class="w-5 h-5"
                        :style="{ filter: `drop-shadow(0 0 2px ${pin.statusColor})` }"
                      />
                  </div>
                  <!-- Show sensor data if available -->
                  <!-- <div v-if="pin.sensorData" class="text-xs mt-1">
                      <div>Temp: {{ pin.sensorData.Temperature }}°C</div>
                      <div>Humidity: {{ pin.sensorData.Humidity }}%</div>
                      <div>Soil Humidity: {{ pin.sensorData.SH }}%</div>
                      <div>Soil Temp: {{ pin.sensorData.ST }}°C</div>
                      <div>Soil pH: {{ pin.sensorData.SPH }}</div>
                      <div>Soil EC: {{ pin.sensorData.SEC }} %</div>
                      <div>Soil N: {{ pin.sensorData.SN }} %</div>
                      <div>Soil P: {{ pin.sensorData.SP }} %</div>
                      <div>Soil K: {{ pin.sensorData.SK }} %</div>
                  </div> -->
              </div>
          </div>
      </div>
  </section>
</template>

<style>
/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.carousel-container {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.map-pin {
  position: absolute;
  cursor: pointer;
}

.tooltip {
    position: absolute;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 1000;
    transform: translate(-50%, -120%);
    transition: background-color 0.3s ease;
}
</style>