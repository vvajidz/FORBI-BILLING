import { useState, useEffect, useRef } from "react";
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
import Barcode from "react-barcode";
import { useToast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  barcode: string;
  price: number;
  selected: boolean;
  qty: number;
}

interface LabelSettings {
  size: string;
  showBarcode: boolean;
  showName: boolean;
  showPrice: boolean;
  showMRP: boolean;
  fontSize: string;
}

export default function BarcodeLabels() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    size: "50x25",
    showBarcode: true,
    showName: true,
    showPrice: true,
    showMRP: false,
    fontSize: "medium"
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.map((p: any) => ({ ...p, selected: false, qty: 1 })));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load products" });
    }
  };

  const toggleProduct = (id: string) => {
    setProducts(products.map(p =>
      p._id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const updateQuantity = (id: string, qty: number) => {
    setProducts(products.map(p =>
      p._id === id ? { ...p, qty: Math.max(1, qty) } : p
    ));
  };

  const handlePrint = () => {
    const selectedProducts = products.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Please select at least one product" });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelWidth = labelSettings.size === "50x25" ? "50mm" : labelSettings.size === "100x50" ? "100mm" : "38mm";
    const labelHeight = labelSettings.size === "50x25" ? "25mm" : labelSettings.size === "100x50" ? "50mm" : "25mm";
    const fontSize = labelSettings.fontSize === "small" ? "8px" : labelSettings.fontSize === "large" ? "14px" : "10px";

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Labels</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10mm;
          }
          .label-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5mm;
          }
          .label {
            width: ${labelWidth};
            height: ${labelHeight};
            border: 1px solid #000;
            padding: 2mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            page-break-inside: avoid;
          }
          .barcode-container {
            margin: 2px 0;
          }
          .product-name {
            font-size: ${fontSize};
            font-weight: bold;
            margin: 2px 0;
          }
          .product-price {
            font-size: ${parseInt(fontSize) + 2}px;
            font-weight: bold;
            margin: 2px 0;
          }
          .barcode-text {
            font-size: 6px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
    `;

    selectedProducts.forEach(product => {
      for (let i = 0; i < product.qty; i++) {
        htmlContent += `
          <div class="label">
            ${labelSettings.showBarcode ? `
              <div class="barcode-container">
                <svg id="barcode-${product._id}-${i}"></svg>
                <div class="barcode-text">${product.barcode}</div>
              </div>
            ` : ''}
            ${labelSettings.showName ? `<div class="product-name">${product.name}</div>` : ''}
            ${labelSettings.showPrice ? `<div class="product-price">₹${product.price}</div>` : ''}
            ${labelSettings.showMRP ? `<div class="product-price">MRP: ₹${product.price}</div>` : ''}
          </div>
        `;
      }
    });

    htmlContent += `
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function() {
    `;

    selectedProducts.forEach(product => {
      for (let i = 0; i < product.qty; i++) {
        htmlContent += `
          JsBarcode("#barcode-${product._id}-${i}", "${product.barcode}", {
            format: "CODE128",
            width: 1,
            height: 30,
            displayValue: false
          });
        `;
      }
    });

    htmlContent += `
            setTimeout(() => window.print(), 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery)
  );

  const totalLabels = products.filter(p => p.selected).reduce((sum, p) => sum + p.qty, 0);
  const selectedProduct = products.find(p => p.selected);

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
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1">
                          <Checkbox
                            checked={product.selected}
                            onCheckedChange={() => toggleProduct(product._id)}
                          />
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
                            value={product.qty}
                            onChange={(e) => updateQuantity(product._id, parseInt(e.target.value) || 1)}
                            min="1"
                            className="h-8 text-right"
                            disabled={!product.selected}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total Labels Selected</span>
              <span className="text-lg font-bold text-primary">
                {totalLabels}
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
                <Select value={labelSettings.size} onValueChange={(val) => setLabelSettings({ ...labelSettings, size: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50x25">50mm x 25mm (Standard)</SelectItem>
                    <SelectItem value="100x50">100mm x 50mm (Large)</SelectItem>
                    <SelectItem value="38x25">38mm x 25mm (Small)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Label Content</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-barcode"
                      checked={labelSettings.showBarcode}
                      onCheckedChange={(checked) => setLabelSettings({ ...labelSettings, showBarcode: !!checked })}
                    />
                    <label htmlFor="show-barcode" className="text-sm font-medium leading-none">
                      Show Barcode
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-name"
                      checked={labelSettings.showName}
                      onCheckedChange={(checked) => setLabelSettings({ ...labelSettings, showName: !!checked })}
                    />
                    <label htmlFor="show-name" className="text-sm font-medium leading-none">
                      Show Product Name
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-price"
                      checked={labelSettings.showPrice}
                      onCheckedChange={(checked) => setLabelSettings({ ...labelSettings, showPrice: !!checked })}
                    />
                    <label htmlFor="show-price" className="text-sm font-medium leading-none">
                      Show Price
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-mrp"
                      checked={labelSettings.showMRP}
                      onCheckedChange={(checked) => setLabelSettings({ ...labelSettings, showMRP: !!checked })}
                    />
                    <label htmlFor="show-mrp" className="text-sm font-medium leading-none">
                      Show MRP
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select value={labelSettings.fontSize} onValueChange={(val) => setLabelSettings({ ...labelSettings, fontSize: val })}>
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
                {selectedProduct ? (
                  <div className="text-center space-y-2">
                    {labelSettings.showBarcode && (
                      <div>
                        <Barcode value={selectedProduct.barcode} width={1} height={40} fontSize={10} />
                      </div>
                    )}
                    {labelSettings.showName && (
                      <div className={`font-medium ${labelSettings.fontSize === 'small' ? 'text-xs' : labelSettings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                        {selectedProduct.name}
                      </div>
                    )}
                    {labelSettings.showPrice && (
                      <div className={`font-bold ${labelSettings.fontSize === 'small' ? 'text-sm' : labelSettings.fontSize === 'large' ? 'text-xl' : 'text-lg'}`}>
                        ₹{selectedProduct.price}
                      </div>
                    )}
                    {labelSettings.showMRP && (
                      <div className="text-sm text-muted-foreground">
                        MRP: ₹{selectedProduct.price}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">Select a product to preview</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-success hover:bg-success/90"
              onClick={handlePrint}
              disabled={totalLabels === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print {totalLabels} Label{totalLabels !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
