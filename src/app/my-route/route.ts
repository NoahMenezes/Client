import { NextResponse } from 'next/server'

export const GET = async () => {
  return NextResponse.json({
    message: 'This is an example of a custom route.',
  })
}
