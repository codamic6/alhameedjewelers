'use client';

import PageTransition from '@/components/PageTransition';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const ringSizes = [
  { pk: 16, diameter: "15.3 mm" },
  { pk: 17, diameter: "15.6 mm" },
  { pk: 18, diameter: "15.9 mm" },
  { pk: 19, diameter: "16.2 mm" },
  { pk: 20, diameter: "16.5 mm" },
  { pk: 21, diameter: "16.8 mm" },
  { pk: 22, diameter: "17.2 mm" },
];

const bangleSizes = [
  { size: "2-2", diameter: "54.0 mm" },
  { size: "2-4", diameter: "57.2 mm" },
  { size: "2-6", diameter: "60.3 mm" },
  { size: "2-8", diameter: "63.5 mm" },
  { size: "2-10", diameter: "66.7 mm" },
];

export default function SizeGuidePage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Sizing Guide</h1>
            <p className="text-lg text-muted-foreground mt-4">Find Your Perfect Fit</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
            <Card>
                <CardHeader>
                    <CardTitle>Ring Size Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PK Size</TableHead>
                                <TableHead>Diameter</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ringSizes.map(size => (
                                <TableRow key={size.pk}>
                                    <TableCell className="font-medium">{size.pk}</TableCell>
                                    <TableCell>{size.diameter}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bangle Size Chart</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bangle Size</TableHead>
                                <TableHead>Inner Diameter</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bangleSizes.map(size => (
                                <TableRow key={size.size}>
                                    <TableCell className="font-medium">{size.size}</TableCell>
                                    <TableCell>{size.diameter}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

         <div className="mt-12 text-center text-muted-foreground p-6 border border-dashed rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">How to Measure</h3>
            <p>To find your ring size, take an existing ring that fits well and measure its inner diameter. Match it with our chart. For bangles, measure the diameter across the widest part of your hand. If you are unsure, we recommend visiting a local jeweler to get your size professionally measured.</p>
        </div>
      </div>
    </PageTransition>
  );
}
