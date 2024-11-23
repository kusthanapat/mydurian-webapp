<script setup>
    import iconPath1 from '~/assets/images/user.png';
    import iconPath2 from '~/assets/images/electric-pole.png';
    import iconPath3 from '~/assets/images/crisis.png';
    import iconPath4 from '~/assets/images/mark.png';

    definePageMeta({
        layout: "defaultuser"
    })

    import { useRoute } from 'vue-router';

    // Get the route object
    const route = useRoute();

    // Extract the UID from the query parameter
    const uid = route.query.uid;

    // Log the UID to confirm it's received
    console.log('User UID:', uid);

    // Function to navigate to a page with the user's UID in the query string
    const navigateTo = (path) => {
        router.push({ path: path, query: { uid: uid } });
    };

    // Use the UID to fetch user-specific data or perform any operations needed
    // เช่น การดึงข้อมูลผู้ใช้จาก Firebase Firestore
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16">
        
        <!-- top show -->
        <div class="flex justify-between items-center mt-20">
            <!-- user -->
            <div class="flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath1" alt="MyDurian Logo" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p id="user_text" class="text-white text-xl">user</p>
                </div>
            </div>

            <!-- pole -->
            <div class="flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath2" alt="MyDurian Logo" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p id="pole_text" class="text-white text-xl">pole</p>
                </div>
            </div>

            <!-- warning -->
            <div class="flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath3" alt="MyDurian Logo" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p id="warning_text" class="text-white text-xl">warning</p>
                </div>
            </div>

            <!-- error -->
            <div class="flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath4" alt="MyDurian Logo" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p id="error_text" class="text-white text-xl">error</p>
                </div>
            </div>
        </div>

        <!-- weather iframe -->
        <div class="w-full flex justify-center items-center">
            <iframe src= "https://www.tmd.go.th/weatherForecast7DaysWidget?province=นนทบุรี" scrolling="no" frameborder="0" class="w-full h-96 bg-transparent rounded-lg"></iframe>
        </div>   

        <!-- google map iframe -->
        <div class="w-full flex justify-center items-center">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.6940547759646!2d100.87203847484058!3d12.927374787383952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310296139344efab%3A0x5777d7113c8165ed!2z4LiW4LiZ4LiZ4LiE4LiZ4LmA4LiU4Li04LiZ4Lie4Lix4LiX4Lii4Liy!5e0!3m2!1sth!2sth!4v1731184772773!5m2!1sth!2sth" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="w-full h-96 rounded-lg"></iframe>
        </div>
    </div>
</template>