<script setup>
  import iconPath from '~/assets/images/icon_durian.png';
</script>

<template>
    <div>
        <div class="sidebar-title items-center">
        <img :src="iconPath" class="w-10 h-10 mx-auto" />
        MyDurian
        </div>   
        <div class="sidebar-avatar">
            <img src="https://via.placeholder.com/150" alt="avatar" class="w-10 h-10 rounded-full mx-auto" />
            <div class="text-center text-white text-sm mt-3">Admin System</div>
        </div>
        <div class="sidebar-menu">
            <NuxtLink class="nav-link" to="/home">
                <i class="fa fa-home"></i>
                Dashboard
            </NuxtLink>
            <NuxtLink class="nav-link" to="/dashboard">
                <i class="fa fa-file-alt"></i>
                Dashboard
            </NuxtLink>
            <NuxtLink class="nav-link" to="/chart">
                <i class="fa fa-file-alt"></i>
                Chart
            </NuxtLink>
            <NuxtLink class="nav-link" to="/add user">
                <i class="fa fa-file-alt"></i>
                Add Users
            </NuxtLink>
            <NuxtLink class="nav-link" to="/contact">
                <i class="fa fa-file-alt"></i>
                Contact
            </NuxtLink>
            <NuxtLink class="nav-link" to="/login">
                <i class="fa fa-file-alt"></i>
                Login
            </NuxtLink>
        </div>
    </div>
</template>
  

  