import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  logo?: string
  bannerImage?: string
  restaurantName?: string
  description?: string
  category?: string
}

// GET - Buscar configurações de tema do restaurante
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const restaurant = searchParams.get('restaurant')

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant parameter is required' },
        { status: 400 }
      )
    }

    const restaurantData = await db.restaurant.findUnique({
      where: { slug: restaurant },
      select: {
        id: true,
        name: true,
        description: true,
        themeConfig: true
      }
    })

    if (!restaurantData) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Parsear configuração de tema atual ou usar padrão
    const currentThemeConfig = (restaurantData.themeConfig as any) || {}
    
    const themeSettings = {
      primaryColor: currentThemeConfig.primaryColor || '#3b82f6',
      secondaryColor: currentThemeConfig.secondaryColor || '#10b981',
      backgroundColor: currentThemeConfig.backgroundColor || '#ffffff',
      textColor: currentThemeConfig.textColor || '#1f2937',
      fontFamily: currentThemeConfig.fontFamily || 'Inter',
      logo: currentThemeConfig.logo || '',
      bannerImage: currentThemeConfig.bannerImage || '',
      restaurantName: restaurantData.name,
      description: restaurantData.description || '',
      category: currentThemeConfig.category || 'geral'
    }

    return NextResponse.json(themeSettings)

  } catch (error) {
    console.error('Error fetching theme config:', error)
    return handleApiError(error)
  }
}

// PUT - Atualizar configurações de tema
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const restaurant = searchParams.get('restaurant')

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant parameter is required' },
        { status: 400 }
      )
    }

    const body = await request.json() as ThemeConfig

    if (!body.primaryColor || !body.secondaryColor) {
      return NextResponse.json(
        { error: 'Primary and secondary colors are required' },
        { status: 400 }
      )
    }

    // Verificar se o restaurante existe
    const restaurantData = await db.restaurant.findUnique({
      where: { slug: restaurant },
      select: { id: true, themeConfig: true }
    })

    if (!restaurantData) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Mesclar configurações existentes com as novas
    const currentThemeConfig = (restaurantData.themeConfig as any) || {}
    const updatedThemeConfig = {
      ...currentThemeConfig,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      backgroundColor: body.backgroundColor || currentThemeConfig.backgroundColor || '#ffffff',
      textColor: body.textColor || currentThemeConfig.textColor || '#1f2937',
      fontFamily: body.fontFamily || currentThemeConfig.fontFamily || 'Inter',
      logo: body.logo !== undefined ? body.logo : currentThemeConfig.logo,
      bannerImage: body.bannerImage !== undefined ? body.bannerImage : currentThemeConfig.bannerImage,
      category: body.category || currentThemeConfig.category || 'geral',
      lastUpdated: new Date().toISOString()
    }

    // Atualizar no banco
    const updateData: any = {
      themeConfig: updatedThemeConfig
    }

    // Se nome ou descrição foram fornecidos, atualizar também
    if (body.restaurantName) {
      updateData.name = body.restaurantName
    }
    if (body.description !== undefined) {
      updateData.description = body.description
    }

    const updatedRestaurant = await db.restaurant.update({
      where: { slug: restaurant },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        themeConfig: true
      }
    })

    // Retornar configurações atualizadas
    const themeSettings = {
      primaryColor: updatedThemeConfig.primaryColor,
      secondaryColor: updatedThemeConfig.secondaryColor,
      backgroundColor: updatedThemeConfig.backgroundColor,
      textColor: updatedThemeConfig.textColor,
      fontFamily: updatedThemeConfig.fontFamily,
      logo: updatedThemeConfig.logo,
      bannerImage: updatedThemeConfig.bannerImage,
      restaurantName: updatedRestaurant.name,
      description: updatedRestaurant.description || '',
      category: updatedThemeConfig.category
    }

    return NextResponse.json({
      message: 'Theme updated successfully',
      themeSettings
    })

  } catch (error) {
    console.error('Error updating theme config:', error)
    return handleApiError(error)
  }
}

// POST - Resetar tema para padrão
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const restaurant = searchParams.get('restaurant')

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant parameter is required' },
        { status: 400 }
      )
    }

    // Verificar se o restaurante existe
    const restaurantData = await db.restaurant.findUnique({
      where: { slug: restaurant },
      select: { id: true, name: true, description: true }
    })

    if (!restaurantData) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Tema padrão
    const defaultThemeConfig = {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter',
      logo: '',
      bannerImage: '',
      category: 'geral',
      lastUpdated: new Date().toISOString()
    }

    await db.restaurant.update({
      where: { slug: restaurant },
      data: {
        themeConfig: defaultThemeConfig
      }
    })

    const themeSettings = {
      primaryColor: defaultThemeConfig.primaryColor,
      secondaryColor: defaultThemeConfig.secondaryColor,
      backgroundColor: defaultThemeConfig.backgroundColor,
      textColor: defaultThemeConfig.textColor,
      fontFamily: defaultThemeConfig.fontFamily,
      logo: defaultThemeConfig.logo,
      bannerImage: defaultThemeConfig.bannerImage,
      restaurantName: restaurantData.name,
      description: restaurantData.description || '',
      category: defaultThemeConfig.category
    }

    return NextResponse.json({
      message: 'Theme reset to default successfully',
      themeSettings
    })

  } catch (error) {
    console.error('Error resetting theme config:', error)
    return handleApiError(error)
  }
}