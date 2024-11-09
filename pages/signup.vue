<script setup>
    import { ref } from 'vue';

    const showSignupForm = ref(true);
    const showOtpForm = ref(false);

    // ฟังก์ชันที่ทำให้แสดงฟอร์ม OTP เมื่อกดปุ่ม Create Account
    const handleCreateAccount = () => {
    showSignupForm.value = false;
    showOtpForm.value = true;
    };
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-black py-6 flex flex-col justify-center sm:py-12">
        <div class="relative py-3 sm:max-w-xl sm:mx-auto">
            <!-- Card container with shadow and glass effect -->
            <div class="relative px-4 py-10 bg-white/10 backdrop-blur-md shadow-xl rounded-3xl sm:p-16">
                <div class="max-w-md mx-auto">
                    <!-- Logo and Header -->
                    <div class="flex flex-col items-center space-y-4 mb-8">
                        <div class="text-center">
                            <h2 class="text-4xl font-bold text-white mb-2">MyDurian</h2>
                            <h3 class="text-xl text-gray-200">Register!</h3>
                        </div>
                    </div>

                    <!-- Sign up Form -->
                    <form v-if="showSignupForm" class="signup_form space-y-6">
                        <div class="flex space-x-4">
                            <!-- First name Input -->
                            <div class="space-y-2">
                                <label for="firstname" class="block text-sm font-medium text-gray-200">
                                    First Name
                                </label>
                                <input type="text" id="firstName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your First Name" />
                            </div>

                            <!-- Last name Input -->
                            <div class="space-y-2">
                                <label for="lastname" class="block text-sm font-medium text-gray-200">
                                    Last Name
                                </label>
                                <input type="text" id="lastName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Last Name" />
                            </div>
                        </div>

                        <!-- Email Input -->
                        <div class="space-y-2">
                            <label for="email" class="block text-sm font-medium text-gray-200">
                                Email
                            </label>
                            <input type="email" id="email" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your Email" />
                        </div>

                        <!-- Password Input -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm font-medium text-gray-200">
                                Password
                            </label>
                            <input type="password" id="password" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your password" />
                        </div>

                        <!--Re Password Input -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm font-medium text-gray-200">
                                Confirm Password
                            </label>
                            <input type="password" id="repassword" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your password" />
                        </div>

                        <div class="flex space-x-4">
                            <!-- Province Input -->
                            <div class="space-y-2">
                                <label for="province" class="block text-sm font-medium text-gray-200">
                                    Province
                                </label>
                                <input type="text" id="province" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Province" />
                            </div>

                            <!-- District Input -->
                            <div class="space-y-2">
                                <label for="district" class="block text-sm font-medium text-gray-200">
                                    District
                                </label>
                                <input type="text" id="district" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your District" />
                            </div>                        
                        </div>

                        <div class="flex space-x-4">
                            <!-- Sub district Input -->
                            <div class="space-y-2">
                                <label for="subdistrict" class="block text-sm font-medium text-gray-200">
                                    Subdistrict
                                </label>
                                <input type="text" id="subdistrict" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Subdistrict" />
                            </div>

                            <!-- Posy code Input -->
                            <div class="space-y-2">
                                <label for="postcode" class="block text-sm font-medium text-gray-200">
                                    Post code
                                </label>
                                <input type="text" id="postcode" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Post code" />
                            </div>                        
                        </div>

                        <div class="flex space-x-4">
                            <!-- Amount of Area Input -->
                            <div class="space-y-2">
                                <label for="area" class="block text-sm font-medium text-gray-200">
                                    Amount of Area
                                </label>
                                <input type="text" id="area" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Amount of Area" />
                            </div>

                            <!-- Amount of Tree Input -->
                            <div class="space-y-2">
                                <label for="tree" class="block text-sm font-medium text-gray-200">
                                    Amount of Tree
                                </label>
                                <input type="text" id="tree" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Amount of Tree" />
                            </div>                        
                        </div>

                        <!-- iframe Input -->
                        <div class="space-y-2">
                            <label for="iframe" class="block text-sm font-medium text-gray-200">
                                Iframe of Googlemap
                            </label>
                            <input type="text" id="iframe" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your Iframe" />
                        </div> 

                        <!-- type durian -->
                        <div class="flex space-x-4">
                            <!-- Type Durian1 Input -->
                            <div class="space-y-2">
                                <label for="type_durian1" class="block text-sm font-medium text-gray-200">
                                    Type Durian 1
                                </label>
                                <input type="text" id="type_durian1" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Type Durian 1" />
                            </div>

                            <!-- Type Durian2 Input -->
                            <div class="space-y-2">
                                <label for="type_durian2" class="block text-sm font-medium text-gray-200">
                                    Type Durian 2
                                </label>
                                <input type="text" id="type_durian2" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Type Durian 2" />
                            </div>  

                            <!-- Type Durian3 Input -->
                            <div class="space-y-2">
                                <label for="type_durian3" class="block text-sm font-medium text-gray-200">
                                    Type Durian 3
                                </label>
                                <input type="text" id="type_durian3" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Type Durian 3" />
                            </div> 
                        </div>

                        <!-- Login Button -->
                        <button type="submit" id="create_account" @click="handleCreateAccount" class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white 
                     font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 
                     focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200 
                     transition duration-200">
                            Create Account
                        </button>
                    </form>

                    <!-- Verify OTP -->
                    <form v-if="showOtpForm" class="otp_form space-y-6">
                        <!-- OTP Input -->
                        <div class="space-y-2 mb-6">
                            <label for="verifyOTP" class="block text-sm font-medium text-gray-200">
                                Verify OTP!
                            </label>
                            <input type="text" id="verifyOTP" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your OTP" />
                        </div>

                        <div class="h-6"></div>

                        <!-- verify OTP Button -->
                        <NuxtLink to="/login" class="w-full">
                            <button type="button" id="verify_otp" class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200 transition duration-200">
                                Verify OTP
                            </button>
                        </NuxtLink>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>