import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CategorizeRequest {
  description: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const categoryKeywords: Record<string, string[]> = {
  "Food & Dining": ["food", "restaurant", "cafe", "lunch", "dinner", "breakfast", "pizza", "burger", "sushi", "mcdonald", "starbucks", "chipotle", "grocery", "groceries", "kroger", "walmart food", "whole foods", "trader joe", "doordash", "uber eats", "grubhub", "postmates", "instacart"],
  "Entertainment": ["movie", "cinema", "netflix", "spotify", "hulu", "disney", "game", "gaming", "xbox", "playstation", "steam", "concert", "show", "theatre", "theater", "ticket", "amc", "regal", "youtube premium", "twitch"],
  "Shopping": ["amazon", "shopping", "clothes", "shirt", "shoes", "nike", "adidas", "target", "walmart", "bestbuy", "mall", "retail", "online shopping", "zara", "h&m", "forever 21", "fashion", "clothing"],
  "Transportation": ["uber", "lyft", "gas", "fuel", "parking", "metro", "bus", "train", "subway", "taxi", "transport", "car", "shell", "chevron", "exxon", "bp", "citgo"],
  "Education": ["book", "course", "udemy", "coursera", "tuition", "school", "college", "university", "textbook", "study", "learning", "education", "khan academy", "skillshare"],
  "Health & Fitness": ["gym", "fitness", "workout", "yoga", "health", "doctor", "pharmacy", "cvs", "walgreens", "medicine", "medical", "hospital", "clinic", "wellness", "supplement", "vitamin", "planet fitness", "la fitness", "equinox"],
  "Bills & Utilities": ["rent", "electric", "electricity", "water", "internet", "phone", "bill", "utility", "at&t", "verizon", "t-mobile", "comcast", "xfinity", "spectrum", "subscription"],
  "Social": ["party", "bar", "club", "drinks", "social", "friends", "date", "hangout", "birthday", "gift", "celebration"],
  "Coffee & Snacks": ["coffee", "starbucks", "dunkin", "cafe", "snack", "tea", "smoothie", "juice", "drink"],
};

function categorizExpense(description: string, categories: Category[]): string {
  const lowerDesc = description.toLowerCase();

  for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        const category = categories.find(c => c.name === categoryName);
        if (category) return category.id;
      }
    }
  }

  const otherCategory = categories.find(c => c.name === "Other");
  return otherCategory?.id || categories[0]?.id || "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { description }: CategorizeRequest = await req.json();

    if (!description) {
      return new Response(
        JSON.stringify({ error: "Description is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*");

    if (categoriesError) {
      throw categoriesError;
    }

    const categoryId = categorizExpense(description, categories || []);
    const category = categories?.find(c => c.id === categoryId);

    return new Response(
      JSON.stringify({ 
        category_id: categoryId,
        category_name: category?.name || "Other",
        category_icon: category?.icon || "📌",
        category_color: category?.color || "#A0A0A0"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
