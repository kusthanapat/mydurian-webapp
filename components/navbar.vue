<script setup>
    import iconPath from '~/assets/images/icon_durian.png';
</script>

<template>
    <nav class="bg-gray-900 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
            <img :src="iconPath" class="w-10 h-10 mx-auto" />
          <a href="/" class="text-white font-bold text-xl">MyDurian</a>
        </div>
        <div class="flex space-x-6">
          <NuxtLink  class="nav-link" to="/home">
            <i class="fa fa-home"></i>
          Home
          </NuxtLink>
          <NuxtLink class="nav-link" to="/dashboard">
            <i class="fa fa-file-alt"></i>
            Dashboard
          </NuxtLink>
          <NuxtLink class="nav-link" to="/chart">
            <i class="fa fa-file-alt"></i>
            Chart
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
    </nav>
</template>
  
