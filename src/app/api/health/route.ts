import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { error } = await supabase.auth.getSession();

    const isConnected = !error || error.message.includes('session');

    if (!isConnected && error) {
      return NextResponse.json(
        {
          status: 'error',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          message: 'Database connection failed',
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      message: 'GymTrack API is running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        message: 'Unexpected error during health check',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}