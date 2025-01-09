<template>
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black font-noto">
        <!-- Navigation -->
        <nav class="bg-gray-900/95 backdrop-blur-md p-4 w-full fixed z-50 shadow-lg">
            <div class="container mx-auto flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center space-x-4">
                    <img :src="iconPath" class="w-12 h-12 hover:scale-110 transition-transform" alt="MyDurian Logo" />
                    <NuxtLink :to="{ path: 'home', query: { uid } }" class="text-white font-bold text-2xl hover:text-lime-400 transition-all font-kanit">
                        MyDurian
                    </NuxtLink>
                </div>

                <!-- Hamburger Menu (768px or smaller) -->
                <div class="hamburger md:hidden" @click="toggleMenu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <!-- Mobile Menu -->
                <div v-if="showMenu" class="mobile-menu md:hidden">
                    <NuxtLink :to="{ path: 'home', query: { uid } }" class="text-gray-300 hover:text-lime-400 transition-all font-kanit">หน้าแรก</NuxtLink>
                    <NuxtLink :to="{ path: 'dashboard', query: { uid } }" class="text-gray-300 hover:text-lime-400 transition-all font-kanit">แดชบอร์ด</NuxtLink>
                    <NuxtLink :to="{ path: 'chart', query: { uid } }" class="text-gray-300 hover:text-lime-400 transition-all font-kanit">กราฟ</NuxtLink>
                    <NuxtLink :to="{ path: 'database', query: { uid } }" class="text-gray-300 hover:text-lime-400 transition-all font-kanit">ดาวน์โหลดข้อมูล</NuxtLink>
                    <NuxtLink to="/" class="px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all font-kanit">
                        ออกจากระบบ
                    </NuxtLink>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex space-x-8">
                    <NuxtLink 
                        :to="{ path: 'home', query: { uid } }" 
                        class="text-gray-300 hover:text-lime-400 transition-all relative group font-kanit">
                        หน้าแรก
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </NuxtLink>
                    <NuxtLink 
                        :to="{ path: 'dashboard', query: { uid } }" 
                        class="text-gray-300 hover:text-lime-400 transition-all relative group font-kanit">
                        แดชบอร์ด
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </NuxtLink>
                    <NuxtLink 
                        :to="{ path: 'chart', query: { uid } }" 
                        class="text-gray-300 hover:text-lime-400 transition-all relative group font-kanit">
                        กราฟ
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </NuxtLink>
                    <NuxtLink 
                        :to="{ path: 'database', query: { uid } }" 
                        class="text-gray-300 hover:text-lime-400 transition-all relative group font-kanit">
                        ดาวน์โหลดข้อมูล
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </NuxtLink>
                </div>

                <div class="hidden md:flex space-x-4">
                    <NuxtLink to="/"
                        class="px-6 py-2 text-gray-300 hover:text-white border border-transparent hover:border-lime-400 rounded-lg transition-all font-kanit">
                        ออกจากระบบ
                    </NuxtLink>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="pt-10 pb-10">
            <slot />
        </div>

        <!-- Footer -->
        <footer class="bg-black/90 text-white">
            <div class="container mx-auto px-8 py-16">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div class="space-y-6">
                        <h3 class="text-2xl font-bold">ติดต่อ</h3>
                        <hr class="border-lime-500/30 w-24" />
                        <ul class="space-y-4">
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">chanin.j@cit.kmutnb.ac.th (ผศ.ดร.ชานินทร์ จูฉิม)</li>
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">supod.k@cit.kmutnb.ac.th (ผศ.ดร.สุพจน์ แก้วกรณ์)</li>
                            <!-- <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Kus</li> -->
                        </ul>
                    </div>

                    <div class="space-y-6">
                        <h3 class="text-2xl font-bold">หน่วยงานที่เกี่ยวข้อง</h3>
                        <hr class="border-lime-500/30 w-24" />
                        <ul class="space-y-4">
                            <li>
                                <a 
                                    href="https://www.doae.go.th/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">
                                    กรมส่งเสริมการเกษตร
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://aic-info.moac.go.th/aic/newsdetail.php?way=PT1nYmxkM2M=&news=PUl6TQ==" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">
                                    AIC นนทบุรี
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://www.kmutnb.ac.th/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">
                                    มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://cit.kmutnb.ac.th/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">
                                    คณะวิทยาลัยเทคโนโลยีอุตสาหกรรม
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://cit.kmutnb.ac.th/%E0%B8%AA%E0%B8%B2%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%8A%E0%B8%B2%E0%B9%80%E0%B8%97%E0%B8%84%E0%B9%82%E0%B8%99%E0%B9%82%E0%B8%A5%E0%B8%A2%E0%B8%B5%E0%B9%81%E0%B8%A1%E0%B8%84%E0%B8%84%E0%B8%B2-2/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">
                                    สาขาวิศวกรรมแมคคาทรอนิกส์
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="space-y-6">
                        <h3 class="text-2xl font-bold">สถานที่</h3>
                        <hr class="border-lime-500/30 w-24" />
                        <ul class="space-y-4">
                            <li>
                                <a 
                                    href="https://www.google.com/maps/place/%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B9%80%E0%B8%97%E0%B8%84%E0%B9%82%E0%B8%99%E0%B9%82%E0%B8%A5%E0%B8%A2%E0%B8%B5%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%88%E0%B8%AD%E0%B8%A1%E0%B9%80%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B9%80%E0%B8%AB%E0%B8%99%E0%B8%B7%E0%B8%AD/@13.819137,100.5117129,17z/data=!3m1!4b1!4m6!3m5!1s0x30e29b877800c9af:0xd754c571fc7177b!8m2!3d13.819137!4d100.5142878!16zL20vMDgxZDc2?entry=ttu&g_ep=EgoyMDI1MDEwNy4wIKXMDSoASAFQAw%3D%3D"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">
                                    1518 ถนน ​ประชา​ราษฎร์​1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพมหานคร 10800
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-800">
                <div class="container mx-auto px-8 py-6">
                    <p class="text-sm text-gray-400">
                        MyDurian - King Mongkut's University of Technology North Bangkok
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
    // จัดการสถานะของ Mobile Menu
    import { ref } from 'vue';
    import { useRoute } from 'vue-router';
    import iconPath from '~/assets/images/icon_durian.png';

    const showMenu = ref(false);

    const toggleMenu = () => {
        showMenu.value = !showMenu.value;
    };

    const route = useRoute();
    const uid = route.query.uid || ''; // ถ้าไม่มี uid ใน query จะใช้ค่าเป็นค่าว่า
</script>

<style>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

/* Define custom font classes */
.font-prompt {
    font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
}

.font-kanit {
    font-family: 'Kanit', 'Noto Sans Thai', sans-serif;
}

.font-noto {
    font-family: 'Noto Sans Thai', sans-serif;
}

/* Mobile Menu Styles */
@media (min-width: 340px) and (max-width: 768px) {
    .md\\:flex {
        display: none;
    }

    .mobile-menu {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
    }

    .hamburger {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        gap: 4px;
    }

    .hamburger span {
        width: 25px;
        height: 3px;
        background-color: white;
        border-radius: 3px;
    }
}
</style>
