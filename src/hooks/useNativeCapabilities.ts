import { useState, useEffect } from 'react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { Device } from '@capacitor/device'
import { Network } from '@capacitor/network'

interface NativeCapabilities {
  camera: boolean
  geolocation: boolean
  device: boolean
  network: boolean
}

interface DeviceInfo {
  platform: string
  model?: string
  operatingSystem: string
  version?: string
  isVirtual?: boolean
}

interface LocationCoords {
  latitude: number
  longitude: number
  accuracy?: number
}

interface NetworkStatus {
  connected: boolean
  connectionType: string
}

export function useNativeCapabilities() {
  const [capabilities, setCapabilities] = useState<NativeCapabilities>({
    camera: false,
    geolocation: false,
    device: false,
    network: false
  })
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null)

  useEffect(() => {
    // Check available capabilities
    const checkCapabilities = async () => {
      try {
        // Check if we're in a native environment
        const isNative = (window as any).Capacitor?.isNativePlatform?.() || false
        
        setCapabilities({
          camera: isNative,
          geolocation: isNative || 'geolocation' in navigator,
          device: isNative,
          network: isNative || 'navigator' in window
        })

        // Get device info if available
        if (isNative) {
          try {
            const info = await Device.getInfo()
            setDeviceInfo({
              platform: info.platform,
              model: info.model,
              operatingSystem: info.operatingSystem,
              version: info.osVersion,
              isVirtual: info.isVirtual
            })
          } catch (error) {
            console.log('Device info not available:', error)
          }

          // Get network status
          try {
            const status = await Network.getStatus()
            setNetworkStatus({
              connected: status.connected,
              connectionType: status.connectionType
            })

            // Listen for network changes
            Network.addListener('networkStatusChange', (status) => {
              setNetworkStatus({
                connected: status.connected,
                connectionType: status.connectionType
              })
            })
          } catch (error) {
            console.log('Network status not available:', error)
          }
        }
      } catch (error) {
        console.log('Error checking capabilities:', error)
      }
    }

    checkCapabilities()
  }, [])

  const takePhoto = async (): Promise<string | null> => {
    if (!capabilities.camera) {
      throw new Error('Camera not available')
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      })

      return image.dataUrl || null
    } catch (error) {
      console.error('Error taking photo:', error)
      throw error
    }
  }

  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    if (!capabilities.geolocation) {
      throw new Error('Geolocation not available')
    }

    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      })

      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy
      }
    } catch (error) {
      console.error('Error getting location:', error)
      
      // Fallback to web geolocation if available
      if ('geolocation' in navigator) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              })
            },
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000 }
          )
        })
      }
      
      throw error
    }
  }

  const isNativeApp = () => {
    return (window as any).Capacitor?.isNativePlatform?.() || false
  }

  return {
    capabilities,
    deviceInfo,
    networkStatus,
    takePhoto,
    getCurrentLocation,
    isNativeApp
  }
}