<template>
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black font-noto">
        <!-- Navigation -->
        <nav class="bg-gray-900/95 backdrop-blur-md p-4 w-full fixed z-50 shadow-lg">
            <div class="container mx-auto flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center space-x-4">
                    <img :src="iconPath" class="w-12 h-12 hover:scale-110 transition-transform" alt="MyDurian Logo" />
                    <NuxtLink to="/" class="text-white font-bold text-2xl hover:text-lime-400 transition-all font-kanit">
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
                    <NuxtLink to="/" class="text-gray-300 hover:text-lime-400 transition-all font-kanit">Home</NuxtLink>
                    <NuxtLink to="/dashboardExam" class="text-gray-300 hover:text-lime-400 transition-all font-kanit">Dashboard</NuxtLink>
                    <NuxtLink to="/chartExam" class="text-gray-300 hover:text-lime-400 transition-all font-kanit">Chart</NuxtLink>
                    <NuxtLink to="/login" class="px-6 py-2 text-gray-300 hover:text-white border hover:border-lime-400 rounded-lg transition-all font-kanit">
                        Login
                    </NuxtLink>
                    <NuxtLink to="/signup" class="px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all font-kanit">
                        Sign up
                    </NuxtLink>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex space-x-8">
                    <NuxtLink 
                        to="/" 
                        class="text-gray-300 hover:text-lime-400 transition-all relative group font-kanit">
                        Home
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/dashboardExam" 
                        class="text-gray-300 hover:text-lime-400 transition-all relative group font-kanit">
                        Dashboard
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </NuxtLink>
                    <NuxtLink 
                        to="/chartExam" 
                        class="text-gray-300 hover:text-lime-400 transition-all relative group font-kanit">
                        Chart
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                    </NuxtLink>
                </div>

                <div class="hidden md:flex space-x-4">
                    <NuxtLink to="/login"
                        class="px-6 py-2 text-gray-300 hover:text-white border border-transparent hover:border-lime-400 rounded-lg transition-all font-kanit">
                        Login
                    </NuxtLink>
                    <NuxtLink to="/signup"
                        class="px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30 font-kanit">
                        Sign up
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
                        <h3 class="text-2xl font-bold">Contact</h3>
                        <hr class="border-lime-500/30 w-24" />
                        <ul class="space-y-4">
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Aj Ko</li>
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Aj Min</li>
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Kus</li>
                        </ul>
                    </div>

                    <div class="space-y-6">
                        <h3 class="text-2xl font-bold">Relevant agencies</h3>
                        <hr class="border-lime-500/30 w-24" />
                        <ul class="space-y-4">
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Aj Ko</li>
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Aj Min</li>
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Kus</li>
                        </ul>
                    </div>

                    <div class="space-y-6">
                        <h3 class="text-2xl font-bold">Location</h3>
                        <hr class="border-lime-500/30 w-24" />
                        <ul class="space-y-4">
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Aj Ko</li>
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Aj Min</li>
                            <li class="text-gray-300 hover:text-lime-400 transition-colors cursor-pointer">Kus</li>
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
import iconPath from '~/assets/images/icon_durian.png';

const showMenu = ref(false);

const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};
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
@media (max-width: 768px) {
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
