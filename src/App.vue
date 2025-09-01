<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Client, ClientConfiguration } from '@nimiq/core'

const consensus = ref<'idle' | 'connecting' | 'established'>('idle')
const client = ref<Client>()
const isConnected = ref(false)
const currentNetwork = ref<string>('')
const selectedNetwork = ref('MainAlbatross')
const isConnecting = ref(false)

const workingNetworks = [
  { value: 'MainAlbatross', label: 'MainAlbatross (UpperCamelCase)' },
  { value: 'mainAlbatross', label: 'mainAlbatross (lowerCamelCase)' },
]

const brokenNetworks = [
  { value: 'TestAlbatross', label: 'TestAlbatross (UpperCamelCase)' },
  { value: 'testalbatross', label: 'testalbatross (lowercase)' },
  { value: 'test-albatross', label: 'test-albatross (kebab-case)' },
  { value: 'main-albatross', label: 'main-albatross (kebab-case)' },
]

async function connect() {
  if (isConnecting.value || client.value) {
    console.log('Already connecting or connected, ignoring request')
    return
  }

  const networkName = selectedNetwork.value
  isConnecting.value = true
  
  try {
    console.log(`Connecting to ${networkName}`)
    
    consensus.value = 'connecting'
    const config = new ClientConfiguration()
    config.network(networkName)
    config.syncMode('pico')
    config.logLevel('debug')

    client.value = await Client.create(config.build())
    
    client.value.addConsensusChangedListener((state) => {
      console.log(`${networkName}: ${state}`)
      consensus.value = state === 'syncing' ? 'connecting' : 'established'
      isConnected.value = state === 'established'
    })

    currentNetwork.value = networkName
    
  } catch (error) {
    console.error(`Failed to connect to ${networkName}:`, error)
    isConnected.value = false
    consensus.value = 'idle'
  } finally {
    isConnecting.value = false
  }
}

async function cleanup() {
  if (client.value) {
    try {
      console.log('Cleaning up client connection...')
      await client.value.disconnectNetwork()
    } catch (error) {
      console.warn('Error during cleanup:', error)
    }
    client.value = undefined
  }
  
  // Reset all state
  consensus.value = 'idle'
  isConnected.value = false
  currentNetwork.value = ''
  isConnecting.value = false
}

// Cleanup on page unload/reload
onUnmounted(cleanup)

// Also cleanup on page visibility change (when tab is hidden/closed)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cleanup()
    }
  })
}

</script>

<template>
  <main class="container" style="max-width: 800px; padding: 1rem; font-size: 0.9rem;">
    <header style="text-align: center; margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.8rem; margin-bottom: 0.3rem;">🔧 Nimiq Network Name Issue</h1>
      <p style="margin: 0; color: var(--muted-color); font-size: 0.85rem;">
        Demonstrating ClientConfiguration parsing bug
      </p>
    </header>
    
    <article style="margin-bottom: 1.5rem; padding: 1rem;">
      <header>
        <h2 style="margin-bottom: 0.5rem; font-size: 1.3rem;">🐛 Issue Description</h2>
      </header>
      <p style="margin-bottom: 0; line-height: 1.4;">
        This demonstrates a bug in the Nimiq library where only <strong>CamelCase</strong> network names work correctly.
        All other naming conventions (<code>kebab-case</code>, <code>lowercase</code>) fail due to improper network name parsing.
      </p>
    </article>

    <article style="margin-bottom: 1.5rem; padding: 1rem;">
      <header>
        <h2 style="margin-bottom: 1rem; font-size: 1.3rem;">🚀 Test the Connection</h2>
      </header>
      
      <div style="margin-bottom: 1rem;">
        <label for="network-select" style="font-weight: 600; margin-bottom: 0.4rem; display: block; font-size: 0.9rem;">
          Choose Network:
        </label>
        <select 
          id="network-select" 
          v-model="selectedNetwork" 
          :disabled="isConnected"
          style="width: 100%; max-width: 350px; font-size: 0.85rem;"
        >
          <optgroup label="✅ Working Networks">
            <option v-for="network in workingNetworks" :key="network.value" :value="network.value">
              {{ network.label }}
            </option>
          </optgroup>
          <optgroup label="🐛 Broken Networks">
            <option v-for="network in brokenNetworks" :key="network.value" :value="network.value">
              {{ network.label }}
            </option>
          </optgroup>
        </select>
      </div>
      
      <button 
        @click="connect" 
        :disabled="isConnected || isConnecting"
        style="margin-bottom: 1rem; min-width: 180px; font-size: 0.85rem; padding: 0.5rem 1rem;"
      >
        {{ isConnected ? '✅ Connected' : isConnecting ? '⏳ Connecting...' : `🔗 Connect to ${selectedNetwork}` }}
      </button>

      <div v-if="currentNetwork" style="margin-top: 1rem;">
        <article style="background: var(--card-background-color); border-left: 3px solid var(--primary); padding: 0.8rem;">
          <header style="padding-bottom: 0.3rem;">
            <h4 style="margin: 0; color: var(--primary); font-size: 1rem;">📊 Connection Status</h4>
          </header>
          <dl style="margin: 0; font-size: 0.85rem;">
            <dt style="font-weight: 600; display: inline;">Network:</dt>
            <dd style="display: inline; margin-left: 0.5rem;">
              <code style="font-size: 0.8rem;">{{ currentNetwork }}</code>
            </dd>
            <br>
            
            <dt style="font-weight: 600; display: inline;">Consensus:</dt>
            <dd style="display: inline; margin-left: 0.5rem;">
              <code style="font-size: 0.8rem;">{{ consensus }}</code>
            </dd>
          </dl>
          <p style="margin-top: 0.8rem; margin-bottom: 0; font-size: 0.8rem;">
            <small>💡 To try another network, refresh the page</small>
          </p>
        </article>
      </div>
    </article>

    <article style="padding: 1rem;">
      <header>
        <h2 style="margin-bottom: 0.8rem; font-size: 1.3rem;">📋 Instructions</h2>
      </header>
      <ol style="line-height: 1.5; font-size: 0.85rem; margin-bottom: 1rem;">
        <li>Select a network from the dropdown (try <strong>MainAlbatross</strong> first)</li>
        <li>Click the connect button and observe the console logs</li>
        <li>Refresh the page to reset the connection</li>
        <li>Try the broken networks to see parsing failures</li>
      </ol>
    </article>
  </main>
</template>
