<script setup>
    import iconPath from '~/assets/images/icon_durian.png';
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { initializeApp } from "firebase/app";
    import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
    const auth = getAuth();

    // Variables
    const username = ref('');
    const password = ref('');
    const router = useRouter();

    // Function for login
    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, username.value, password.value);
            const user = userCredential.user;

            // Check if the logged-in user's UID matches the specific UID for admin
            if (user.uid === '46LyYu28VCOHW2UvCspi2aDbpZC3') {
                // Redirect to the admin page
                router.push('admins/admin');
            } else {
                // Redirect to the home page with the user's UID as a query parameter
                router.push({ path: 'users/home', query: { uid: user.uid } });
            }
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Login failed: ' + error.message);
        }
    };

    // const handleLogin = async (event) => {
    //     event.preventDefault();

    //     try {
    //         const userCredential = await signInWithEmailAndPassword(auth, username.value, password.value);
    //         const user = userCredential.user;

    //         // Redirect to the home page with the user's UID as a query parameter
    //         router.push({ path: 'users/home', query: { uid: user.uid } });
    //     } catch (error) {
    //         console.error('Error signing in:', error);
    //         alert('Login failed: ' + error.message);
    //     }
    // };
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-black py-6 flex flex-col justify-center sm:py-12">
        <div class="relative py-3 sm:max-w-xl sm:mx-auto">
            <!-- Card container with shadow and glass effect -->
            <div class="relative px-4 py-10 bg-white/10 backdrop-blur-md shadow-xl rounded-3xl sm:p-16">
                <div class="max-w-md mx-auto">
                    <!-- Logo and Header -->
                    <div class="flex flex-col items-center space-y-4 mb-8">
                        <img :src="iconPath" alt="MyDurian Logo" class="w-20 h-20" />
                        <div class="text-center">
                            <h2 class="text-4xl font-bold text-white mb-2">MyDurian</h2>
                            <h3 class="text-xl text-gray-200">Welcome back!</h3>
                        </div>
                    </div>

                    <!-- Login Form -->
                    <form @submit.prevent="handleLogin" class="space-y-6">
                        <!-- Username Input -->
                        <div class="space-y-2">
                            <label for="username" class="block text-sm font-medium text-gray-200">
                                Username
                            </label>
                            <input type="text" v-model="username" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your username" />
                        </div>

                        <!-- Password Input -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm font-medium text-gray-200">
                                Password
                            </label>
                            <input type="password" v-model="password" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your password" />
                        </div>

                        <!-- Remember Me & Forgot Password -->
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center">
                                <input type="checkbox" id="remember-me"
                                    class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                <label for="remember-me" class="ml-2 block text-sm text-gray-200">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" class="text-sm text-purple-300 hover:text-purple-200">
                                Forgot password?
                            </a>
                        </div>

                        <!-- Login Button -->
                        <button type="submit" class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white 
                        font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200 
                        transition duration-200">
                        Sign in
                        </button>                        
                    </form>

                    <!-- Sign Up Link -->
                    <div class="text-center mt-6">
                        <p class="text-gray-200">
                            Don't have an account?
                            <nuxt-link to="signup">
                                <a href="signup.vue" class="text-purple-300 hover:text-purple-200 font-semibold">
                                    Sign up
                                </a>
                            </nuxt-link>

                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>