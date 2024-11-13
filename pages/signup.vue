<script setup>
    import { ref } from 'vue';
    import { initializeApp } from "firebase/app";
    import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
    import { getFirestore, setDoc, doc } from "firebase/firestore";
    import emailjs from '@emailjs/browser';

    // Initialize Firebase
    const firebaseConfig = {
    apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
    authDomain: "checklogin-67a92.firebaseapp.com",
    projectId: "checklogin-67a92",
    storageBucket: "checklogin-67a92.appspot.com",
    messagingSenderId: "246538906966",
    appId: "1:246538906966:web:2e4399caaa96210df23af7",
    measurementId: "G-X3068LRCWT"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getFirestore(app);

    emailjs.init('LEGDxzoAXq2t4E9a7');

    const showSignupForm = ref(true);
    const showOtpForm = ref(false);
    const generatedOTP = ref('');

    // ตัวเลือกทั้งหมดของทุเรียน
    const durianOptions = [
        "ก้านยาวทรงหวด", "ก้านยาวสีนาก", "ชมพูพาน", "หมอนทอง", "กำปั่นดำ", "กำปั่นพวง",
        "กำปั่นเหลือง(เจ้ากรม)", "กำปั่นเดิม(ขาว)", "กำปั่นตาแพ", "ชายมะไฟ", "ดาวกระจาย",
        "ทองย้อยเดิม", "ทองย้อยฉัตร", "ฉัตรสีทอง", "ฉัตรสีนาก", "นกหยิบ", "อีหนัก", "ทับทิม",
        "กบก้านสั้น", "กบชายน้ำ", "กบสุวรรณ", "กบจำปา", "กบตาขำ", "กบตาเต่า", "กบตานวล",
        "กบไว", "กบพิกุล", "กบทองคำ", "กบตามาก", "กบแม่เฒ่า", "กบเล็บเหยี่ยว", "กบวัดกล้วย",
        "กบสาวน้อย", "กบเจ้าคุณ", "กบหน้าศาล", "กบหลังวิหาร", "กบหัวสิงห์", "กบเหมราช",
        "กบเหลือง", "กระดุมทอง", "กระดุมสีนาก", "กระปุกทองดี", "กลีบสมุทร", "กะเทยเนื้อขาว",
        "กะเทยเนื้อเหลือง", "การะเกด", "เจ้าเงาะ", "ชายมังคุด", "ตะพาบน้ำ", "ธรณีไหว",
        "บางขุนนนท์", "เขียวตำลึง", "เม็ดในยายปราง", "เม็ดในก้านยาว", "สาวชม", "สาวชมฟักทอง",
        "จอกลอย", "บาตรทองคำ", "ชะนี", "อีลวง", "อีลีบ", "ย่ำมะหวาด", "แดงรัศมี", "ชมพูศรี",
        "นวลทองจันทร์", "พวงมณี", "ฟักข้าว", "มูซานคิง", "ละอองฟ้า", "ซ่อนกลิ่น", "ทองกมล",
        "ทองแดง", "ทองลินจง", "ทองลิ้นจี่", "ลำเจียก", "ก้านยาววัดสัก", "จันทบุรี1", "จันทบุรี2",
        "จันทบุรี3", "จันทบุรี5", "หลงลับแล", "หลินลับแล"
    ];

    // ฟังก์ชันส่ง OTP
    const sendOTP = async (email, firstName) => {
        generatedOTP.value = Math.floor(1000 + Math.random() * 9000).toString(); // สร้าง OTP 4 หลัก
        const params = {
            name: firstName,
            to_email: email,
            message: generatedOTP.value
        };

        try {
            await emailjs.send("service_s58b949", "template_8kqzp82", params);
            alert(`OTP ถูกส่งไปที่ ${email}`);
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("เกิดข้อผิดพลาดในการส่ง OTP: " + error.message);
        }
    };

    // ฟังก์ชันที่ทำให้แสดงฟอร์ม OTP เมื่อกดปุ่ม Create Account และส่ง OTP
    const handleCreateAccount = async (event) => {
        const form = document.querySelector('form.signup_form');
        const inputs = form.querySelectorAll('input[required]');
        const selects = form.querySelectorAll('select[required]');

        let allFieldsValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
            allFieldsValid = false;
            }
        });

        selects.forEach(select => {
            if (!select.value || select.value === 'Type1' || select.value === 'Type2' || select.value === 'Type3') {
            allFieldsValid = false;
            }
        });

        if (!allFieldsValid) {
            event.preventDefault();
            alert('กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน');
            return;
        }

        const email = document.getElementById('email').value;
        const firstName = document.getElementById('firstName').value;
        await sendOTP(email, firstName);

        showSignupForm.value = false;
        showOtpForm.value = true;
    };

    // ฟังก์ชันตรวจสอบ OTP และบันทึกข้อมูลลง Firestore
    const handleVerifyOTP = async () => {
        const enteredOTP = document.getElementById('verifyOTP').value;

        if (enteredOTP === generatedOTP.value) {
            try {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const firstName = document.getElementById('firstName').value;
                const lastName = document.getElementById('lastName').value;
                const province = document.getElementById('province').value;
                const district = document.getElementById('district').value;
                const subdistrict = document.getElementById('subdistrict').value;
                const postcode = document.getElementById('postcode').value;

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    province: province,
                    district: district,
                    subdistrict: subdistrict,
                    postcode: postcode,
                    createdAt: new Date()
                });

                alert("บันทึกข้อมูลเรียบร้อย");
                window.location.href = "/login"; // เปลี่ยนไปยังหน้า login
            } catch (error) {
                console.error("Error signing up or saving data:", error);
                alert("Error: " + error.message);
            }
        } else {
            alert("OTP ไม่ถูกต้อง กรุณาลองใหม่");
        }
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
                                    First Name <span class="text-red-600">*</span>
                                </label>
                                <input type="text" id="firstName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your First Name" required />
                            </div>

                            <!-- Last name Input -->
                            <div class="space-y-2">
                                <label for="lastname" class="block text-sm font-medium text-gray-200">
                                    Last Name <span class="text-red-600">*</span>
                                </label>
                                <input type="text" id="lastName" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Last Name" required />
                            </div>
                        </div>

                        <!-- Email Input -->
                        <div class="space-y-2">
                            <label for="email" class="block text-sm font-medium text-gray-200">
                                Email <span class="text-red-600">*</span>
                            </label>
                            <input type="email" id="email" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your Email" required />
                        </div>

                        <!-- Password Input -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm font-medium text-gray-200">
                                Password <span class="text-red-600">*</span>
                            </label>
                            <input type="password" id="password" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your password" required />
                        </div>

                        <!--Re Password Input -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm font-medium text-gray-200">
                                Confirm Password <span class="text-red-600">*</span>
                            </label>
                            <input type="password" id="repassword" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Enter your password" required />
                        </div>

                        <div class="flex space-x-4">
                            <!-- Province Input -->
                            <div class="space-y-2">
                                <label for="province" class="block text-sm font-medium text-gray-200">
                                    Province <span class="text-red-600">*</span>
                                </label>
                                <input type="text" id="province" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Province" required />
                            </div>

                            <!-- District Input -->
                            <div class="space-y-2">
                                <label for="district" class="block text-sm font-medium text-gray-200">
                                    District <span class="text-red-600">*</span>
                                </label>
                                <input type="text" id="district" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your District" required />
                            </div>                        
                        </div>

                        <div class="flex space-x-4">
                            <!-- Sub district Input -->
                            <div class="space-y-2">
                                <label for="subdistrict" class="block text-sm font-medium text-gray-200">
                                    Subdistrict <span class="text-red-600">*</span>
                                </label>
                                <input type="text" id="subdistrict" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Subdistrict" required />
                            </div>

                            <!-- Posy code Input -->
                            <div class="space-y-2">
                                <label for="postcode" class="block text-sm font-medium text-gray-200">
                                    Post code <span class="text-red-600">*</span>
                                </label>
                                <input type="text" id="postcode" class="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-300/20 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Post code" required />
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
                                    Type Durian 1 <span class="text-red-600">*</span>
                                </label>
                                <select v-model="typeDurian1" id="input_typedurian1" required class="w-full px-4 py-3 rounded-lg bg-white/10 text-gray-500 border border-gray-300/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200">
                                    <option disabled selected>Type1</option>
                                    <option v-for="option in durianOptions" :key="option" :value="option">{{ option }}</option>
                                </select>
                            </div>

                            <!-- Type Durian2 Input -->
                            <div class="space-y-2">
                                <label for="type_durian2" class="block text-sm font-medium text-gray-200">
                                    Type Durian 2
                                </label>
                                <select v-model="typeDurian2" id="input_typedurian2" required class="w-full px-4 py-3 rounded-lg bg-white/10 text-gray-500 border border-gray-300/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200">
                                    <option disabled selected>Type2</option>
                                    <option v-for="option in durianOptions" :key="option" :value="option">{{ option }}</option>
                                </select>
                            </div>

                            <!-- Type Durian3 Input -->
                            <div class="space-y-2">
                                <label for="type_durian3" class="block text-sm font-medium text-gray-200">
                                    Type Durian 3
                                </label>
                                <select v-model="typeDurian3" id="input_typedurian3" required class="w-full px-4 py-3 rounded-lg bg-white/10 text-gray-500 border border-gray-300/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200">
                                    <option disabled selected>Type3</option>
                                    <option v-for="option in durianOptions" :key="option" :value="option">{{ option }}</option>
                                </select>
                            </div>
                        </div>

                        <!-- Create Account Button -->
                        <button type="submit" id="create_account" @click.prevent="handleCreateAccount" class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white 
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
                            <button type="button" id="verify_otp" @click="handleVerifyOTP" class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200 transition duration-200">
                                Verify OTP
                            </button>
                        </NuxtLink>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
