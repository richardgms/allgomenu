import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'

interface SimpleThemeConfig {
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

// GET - Buscar configurações de tema simplificadas
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

    // Simplificar extração de configurações de tema
    const themeConfig = (restaurantData.themeConfig as any) || {}
    
    const themeSettings: SimpleThemeConfig = {
      primaryColor: themeConfig.primaryColor || '#3b82f6',
      secondaryColor: themeConfig.secondaryColor || '#10b981',
      backgroundColor: themeConfig.backgroundColor || '#ffffff',
      textColor: themeConfig.textColor || '#1f2937',
      fontFamily: themeConfig.fontFamily || 'Inter',
      logo: themeConfig.logo || '',
      bannerImage: themeConfig.bannerImage || '',
      restaurantName: restaurantData.name,
      description: restaurantData.description || '',
      category: themeConfig.category || 'geral'
    }

    return NextResponse.json(themeSettings)

  } catch (error) {
    console.error('Error fetching theme config:', error)
    return handleApiError(error)
  }
}

// PUT - Atualizar configurações de tema (simplificado)
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

    const body = await request.json() as SimpleThemeConfig

    if (!body.primaryColor || !body.secondaryColor) {
      return NextResponse.json(
        { error: 'Primary and secondary colors are required' },
        { status: 400 }
      )
    }

    console.log(`[Theme API] Updating theme for ${restaurant}:`, {
      primary: body.primaryColor,
      secondary: body.secondaryColor
    })

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

    // Configuração simplificada - focar nas cores principais
    const updatedThemeConfig = {
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      backgroundColor: body.backgroundColor || '#ffffff',
      textColor: body.textColor || '#1f2937',
      fontFamily: body.fontFamily || 'Inter',
      logo: body.logo || '',
      bannerImage: body.bannerImage || '',
      category: body.category || 'geral',
      lastUpdated: new Date().toISOString()
    }

    // Atualizar no banco
    const updateData: any = {
      themeConfig: updatedThemeConfig
    }

    // Atualizar nome e descrição se fornecidos
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

    console.log(`[Theme API] Theme updated successfully for ${restaurant}`)

    // Retornar configurações atualizadas simplificadas
    const responseSettings: SimpleThemeConfig = {
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
      themeSettings: responseSettings
    })

  } catch (error) {
    console.error('Error updating theme config:', error)
    return handleApiError(error)
  }
}

// POST - Resetar tema para padrão (simplificado)
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

    console.log(`[Theme API] Resetting theme to default for ${restaurant}`)

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

    // Tema padrão simplificado
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

    console.log(`[Theme API] Theme reset successfully for ${restaurant}`)

    const responseSettings: SimpleThemeConfig = {
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
      themeSettings: responseSettings
    })

  } catch (error) {
    console.error('Error resetting theme config:', error)
    return handleApiError(error)
  }
}