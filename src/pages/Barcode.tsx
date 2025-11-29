import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Printer, Eye } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Parle-G Biscuit",
    barcode: "8901063101012",
    price: 25,
    selected: false,
    qty: 10,
  },
  {
    id: 2,
    name: "Dove Shampoo 200ml",
    barcode: "8901030741234",
    price: 120,
    selected: false,
    qty: 5,
  },
  {
    id: 3,
    name: "Lays Classic",
    barcode: "8901234567890",
    price: 20,
    selected: false,
    qty: 20,
  },
  {
    id: 4,
    name: "Colgate 100g",
    barcode: "8901234509876",
    price: 45,
    selected: false,
    qty: 15,
  },
];

export default function Barcode() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barcode & Label Printing</h1>
          <p className="text-muted-foreground">Generate and print product labels</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>

            <div className="border rounded-lg">
              <div className="bg-muted/50 p-3 border-b">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Product</div>
                  <div className="col-span-3">Barcode</div>
                  <div className="col-span-3 text-right">Label Qty</div>
                </div>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1">
                        <Checkbox />
                      </div>
                      <div className="col-span-5">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ₹{product.price}
                        </div>
                      </div>
                      <div className="col-span-3 text-xs font-mono text-muted-foreground">
                        {product.barcode}
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          defaultValue={product.qty}
                          min="1"
                          className="h-8 text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total Labels Selected</span>
              <span className="text-lg font-bold text-primary">
                {products.reduce((sum, p) => sum + p.qty, 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Label Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Size</Label>
                <Select defaultValue="50x25">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50x25">50mm x 25mm (Standard)</SelectItem>
                    <SelectItem value="100x50">100mm x 50mm (Large)</SelectItem>
                    <SelectItem value="38x25">38mm x 25mm (Small)</SelectItem>
                    <SelectItem value="custom">Custom Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Label Content</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-barcode" defaultChecked />
                    <label
                      htmlFor="show-barcode"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Barcode
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-name" defaultChecked />
                    <label
                      htmlFor="show-name"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Product Name
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-price" defaultChecked />
                    <label
                      htmlFor="show-price"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Price
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-mrp" />
                    <label
                      htmlFor="show-mrp"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show MRP
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Label Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 flex items-center justify-center min-h-[200px] bg-muted/20">
                <div className="text-center space-y-4">
                  <div className="font-mono text-xs text-muted-foreground">
                    8901063101012
                  </div>
                  <div className="h-16 bg-gradient-to-r from-black via-black to-black" style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, black 0px, black 2px, white 2px, white 4px)',
                  }}></div>
                  <div className="text-sm font-medium">Parle-G Biscuit</div>
                  <div className="text-lg font-bold">₹25</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button className="flex-1" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview All Labels
            </Button>
            <Button className="flex-1 bg-success hover:bg-success/90">
              <Printer className="mr-2 h-4 w-4" />
              Print Labels
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
