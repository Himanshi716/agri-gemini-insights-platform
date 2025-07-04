import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import type { Database } from '@/integrations/supabase/types'

type SensorReading = Database['public']['Tables']['sensor_readings']['Row']

interface SensorChartProps {
  title: string
  description?: string
  data: SensorReading[]
  sensorType: string
  variant?: 'line' | 'area'
}

export function SensorChart({ title, description, data, sensorType, variant = 'line' }: SensorChartProps) {
  // Process data for chart
  const chartData = data
    .filter(reading => reading.timestamp)
    .map(reading => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: Number(reading.value),
      unit: reading.unit
    }))
    .reverse() // Show chronological order

  const getColorByType = (type: string) => {
    switch (type) {
      case 'temperature': return 'hsl(var(--destructive))'
      case 'humidity': return 'hsl(var(--info))'
      case 'soil_moisture': return 'hsl(var(--success))'
      case 'ph': return 'hsl(var(--warning))'
      case 'light': return 'hsl(var(--accent))'
      case 'co2': return 'hsl(var(--primary))'
      default: return 'hsl(var(--primary))'
    }
  }

  const color = getColorByType(sensorType)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {variant === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}${props.payload.unit}`,
                    'Value'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}${props.payload.unit}`,
                    'Value'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: color }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}